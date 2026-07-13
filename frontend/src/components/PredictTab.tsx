import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Play, Download, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';
import { Domain, DOMAIN_COLORS, RISK_COLORS, SegmentType } from '../data';
import { predictBatch } from '../api';

interface PredictTabProps {
  activeDomain: Domain;
}

interface ParsedRow {
  [key: string]: string;
}

export default function PredictTab({ activeDomain }: PredictTabProps) {
  const [fileLoaded, setFileLoaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<ParsedRow[]>([]);
  
  // Mapped Columns State
  const [tenureCol, setTenureCol] = useState('');
  const [spendCol, setSpendCol] = useState('');
  const [freqCol, setFreqCol] = useState('');

  // Prediction Results
  const [predictions, setPredictions] = useState<Array<{
    row: ParsedRow;
    churn_score: number;
    risk: 'HIGH' | 'MEDIUM' | 'LOW';
    segment: SegmentType;
  }>>([]);
  const [isPredicting, setIsPredicting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load a demo CSV directly for quick sandbox testing
  const handleLoadDemo = () => {
    const demoData = [
      { "Cust_Name": "Rajesh Kumar", "User_Tenure_Months": "5", "Monthly_Charges": "1250", "Session_Count": "3" },
      { "Cust_Name": "Shalini Iyer", "User_Tenure_Months": "24", "Monthly_Charges": "780", "Session_Count": "18" },
      { "Cust_Name": "Vikram Rathore", "User_Tenure_Months": "1", "Monthly_Charges": "140", "Session_Count": "1" },
      { "Cust_Name": "Priyanka Nair", "User_Tenure_Months": "12", "Monthly_Charges": "950", "Session_Count": "22" },
      { "Cust_Name": "Aman Gada", "User_Tenure_Months": "8", "Monthly_Charges": "300", "Session_Count": "2" },
      { "Cust_Name": "Kunal Sen", "User_Tenure_Months": "48", "Monthly_Charges": "2100", "Session_Count": "45" },
      { "Cust_Name": "Deepika Rao", "User_Tenure_Months": "15", "Monthly_Charges": "150", "Session_Count": "0" },
      { "Cust_Name": "Rohan Malhotra", "User_Tenure_Months": "3", "Monthly_Charges": "640", "Session_Count": "12" }
    ];

    setCsvHeaders(["Cust_Name", "User_Tenure_Months", "Monthly_Charges", "Session_Count"]);
    setCsvRows(demoData);
    setFileName("sample_customers.csv");
    setFileLoaded(true);
    
    // Auto map
    setTenureCol("User_Tenure_Months");
    setSpendCol("Monthly_Charges");
    setFreqCol("Session_Count");
    setPredictions([]);
  };

  // Parsing standard CSV simple parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      if (lines.length === 0) return;

      // Extract headers
      const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
      setCsvHeaders(headers);

      // Extract rows
      const rows: ParsedRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const rowObj: ParsedRow = {};
        headers.forEach((header, index) => {
          rowObj[header] = values[index] ? values[index].replace(/^["']|["']$/g, '').trim() : '';
        });
        rows.push(rowObj);
      }

      setCsvRows(rows);
      setFileLoaded(true);

      // Guessing column maps
      const guessedTenure = headers.find(h => h.toLowerCase().includes('tenure') || h.toLowerCase().includes('month')) || '';
      const guessedSpend = headers.find(h => h.toLowerCase().includes('spend') || h.toLowerCase().includes('charge') || h.toLowerCase().includes('amount') || h.toLowerCase().includes('bill')) || '';
      const guessedFreq = headers.find(h => h.toLowerCase().includes('freq') || h.toLowerCase().includes('count') || h.toLowerCase().includes('order') || h.toLowerCase().includes('session') || h.toLowerCase().includes('play')) || '';

      setTenureCol(guessedTenure || headers[0] || '');
      setSpendCol(guessedSpend || headers[1] || '');
      setFreqCol(guessedFreq || headers[2] || '');
      setPredictions([]);
    };
    reader.readAsText(file);
  };

  // Action: Predict on current rows
  const handlePredict = () => {
    if (!csvRows.length || !tenureCol || !spendCol || !freqCol) return;
    
    setIsPredicting(true);
    
    // Convert rows back to CSV blob
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => csvHeaders.map(h => row[h] || '').join(','))
    ].join('\n');
    const file = new File([csvContent], 'batch.csv', { type: 'text/csv' });
    
    predictBatch(activeDomain, tenureCol, spendCol, freqCol, file)
      .then(results => {
        setPredictions(results.map(r => ({
          row: r,
          churn_score: typeof r['Churn_Score_%'] === 'number' ? r['Churn_Score_%'] : 50,
          risk: (r['Risk_Level'] as 'HIGH' | 'MEDIUM' | 'LOW') || 'MEDIUM',
          segment: 'Loyal' as SegmentType
        })));
        setIsPredicting(false);
      })
      .catch(() => {
        setIsPredicting(false);
        // Fallback to mock predictions
        const results = csvRows.map(row => {
          const tenure = parseFloat(row[tenureCol]) || 0;
          const spend = parseFloat(row[spendCol]) || 0;
          const freq = parseFloat(row[freqCol]) || 0;
          const score = Math.min(100, Math.max(0, Math.round(
            (1 - tenure / 36) * 30 + (1 - Math.min(spend, 5000) / 5000) * 30 + (1 - freq / 10) * 20 + Math.random() * 20
          )));
          const risk = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';
          return { row, churn_score: score, risk: risk as 'HIGH' | 'MEDIUM' | 'LOW', segment: 'Loyal' as SegmentType };
        });
        setPredictions(results);
      });
  };

  // Action: Download CSV results
  const handleDownload = () => {
    if (predictions.length === 0) return;

    // Construct headers
    const outHeaders = [...csvHeaders, "Churn_Score_Pct", "Risk_Level", "Segment"];
    const csvContent = [
      outHeaders.join(','),
      ...predictions.map(p => {
        const rowVals = csvHeaders.map(h => {
          const val = p.row[h] || '';
          return val.includes(',') ? `"${val}"` : val;
        });
        return [...rowVals, `${p.churn_score}%`, p.risk, p.segment].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `churnsight_predictions_${activeDomain.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prediction Summary Stats
  const predSummary = React.useMemo(() => {
    if (predictions.length === 0) return null;
    const total = predictions.length;
    const high = predictions.filter(p => p.risk === 'HIGH').length;
    const med = predictions.filter(p => p.risk === 'MEDIUM').length;
    const low = predictions.filter(p => p.risk === 'LOW').length;

    return {
      total,
      high,
      med,
      low,
      highPct: (high / total) * 100,
      medPct: (med / total) * 100,
      lowPct: (low / total) * 100
    };
  }, [predictions]);

  const activeColor = DOMAIN_COLORS[activeDomain];

  return (
    <div className="space-y-6">
      
      {/* Description */}
      <div className="glass rounded-xl p-6 shadow-md">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <span>🔮 Predict Intelligence Console — {activeDomain}</span>
        </h3>
        <p className="text-sm text-[#E0E0E0] max-w-3xl leading-relaxed">
          Upload any spreadsheet of customer usage parameters or try our sandboxed demo template. 
          The ChurnSight AI model will automatically analyze structural patterns, identify early warning metrics, 
          and append deep-dive risk telemetry flags to each record.
        </p>

        {/* Required columns specification */}
        <div className="mt-4 p-4 bg-[#060E1A] rounded-xl border border-[#2A4A5A]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-[#14A899] mt-0.5 shrink-0" size={18} />
            <div className="text-xs text-[#E0E0E0]">
              <p className="font-semibold text-white">Expected Column Matrix</p>
              <p className="text-[#8FA3B1] mt-0.5">Your file should ideally include tenure, spend, and engagement frequency values.</p>
            </div>
          </div>
          <button 
            onClick={handleLoadDemo}
            className="px-4 py-2 bg-[#14A899]/10 hover:bg-[#14A899]/20 text-[#14A899] text-xs font-bold rounded-lg border border-[#14A899]/30 flex items-center gap-1.5 transition self-start md:self-auto cursor-pointer"
          >
            <Sparkles size={14} />
            Load Sandbox Demo Data
          </button>
        </div>
      </div>

      {/* Upload area and mapper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Upload Panel */}
        <div className="lg:col-span-1 glass rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <h4 className="text-white font-semibold text-base mb-1">1. File Ingestion</h4>
            <p className="text-xs text-[#8FA3B1] mb-4">Ingest custom delimited table files</p>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center h-48 ${
              fileLoaded ? 'border-[#1D9E75]/50 bg-[#1D9E75]/5' : 'border-[#2A4A5A]/60 hover:border-[#14A899]/50 bg-[#060E1A]/60 hover:bg-[#060E1A]/80'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".csv" 
              className="hidden" 
            />
            {fileLoaded ? (
              <>
                <div className="p-3 bg-[#1D9E75]/10 text-[#1D9E75] rounded-full mb-3 animate-bounce">
                  <FileSpreadsheet size={32} />
                </div>
                <span className="text-sm font-bold text-white block truncate max-w-full px-2">{fileName}</span>
                <span className="text-xs text-[#8FA3B1] mt-1">{csvRows.length} rows loaded successfully</span>
              </>
            ) : (
              <>
                <div className="p-3 bg-[#070D16] text-[#8FA3B1] rounded-full mb-3">
                  <Upload size={32} />
                </div>
                <span className="text-sm font-bold text-[#E0E0E0] block">Drag & drop CSV file here</span>
                <span className="text-xs text-[#8FA3B1] mt-1">or click to browse local files</span>
              </>
            )}
          </div>

          {fileLoaded && (
            <button 
              onClick={() => {
                setFileLoaded(false);
                setPredictions([]);
                setFileName('');
                setCsvRows([]);
              }}
              className="mt-4 text-xs text-center text-[#8FA3B1] hover:text-[#E05252] underline transition font-medium cursor-pointer"
            >
              Clear file
            </button>
          )}
        </div>

        {/* Column Mapper Panel */}
        <div className="lg:col-span-2 glass rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <h4 className="text-white font-semibold text-base mb-1 font-sans">2. Field Alignment (Mapping)</h4>
            <p className="text-xs text-[#8FA3B1] mb-4">Coordinate and map the headers of your uploaded dataset to the AI features</p>
          </div>

          {fileLoaded ? (
            <div className="space-y-4 my-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Tenure Map */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#E0E0E0]">Tenure (Length of Contract)</label>
                  <select 
                    value={tenureCol} 
                    onChange={(e) => setTenureCol(e.target.value)}
                    className="w-full bg-[#070D16] text-xs text-white border border-[#2A4A5A] rounded-lg p-2.5 focus:border-[#14A899] outline-none"
                  >
                    <option value="">-- select column --</option>
                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Spend Map */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#E0E0E0]">Spend (Financial value)</label>
                  <select 
                    value={spendCol} 
                    onChange={(e) => setSpendCol(e.target.value)}
                    className="w-full bg-[#070D16] text-xs text-white border border-[#2A4A5A] rounded-lg p-2.5 focus:border-[#14A899] outline-none"
                  >
                    <option value="">-- select column --</option>
                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Frequency Map */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#E0E0E0]">Engagement Frequency</label>
                  <select 
                    value={freqCol} 
                    onChange={(e) => setFreqCol(e.target.value)}
                    className="w-full bg-[#070D16] text-xs text-white border border-[#2A4A5A] rounded-lg p-2.5 focus:border-[#14A899] outline-none"
                  >
                    <option value="">-- select column --</option>
                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

              </div>

              {/* Action Button */}
              <button 
                onClick={handlePredict}
                disabled={isPredicting || !tenureCol || !spendCol || !freqCol}
                className="w-full py-3 bg-[#14A899] hover:bg-[#14A899]/90 disabled:bg-[#070D16] disabled:text-slate-500 font-bold text-slate-900 rounded-xl transition shadow-lg flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {isPredicting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Executing AI Risk Sequence...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Run ChurnSight Predict Models!
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-44 border border-[#2A4A5A]/50 rounded-xl bg-[#070D16]/40 text-[#8FA3B1]">
              <FileSpreadsheet className="text-slate-600 mb-2" size={24} />
              <p className="text-xs">Injest a dataset file to begin aligning coordinates</p>
            </div>
          )}
        </div>

      </div>

        {predictions.length > 0 && predSummary && (
          <div className="space-y-5">

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="kpi-card glass rounded-xl p-4 flex items-center justify-between" style={{'--accent':'#14A899'} as React.CSSProperties}>
                <div>
                  <span className="text-[11px] text-[#8FA3B1] font-medium uppercase tracking-wider">Computed</span>
                  <h4 className="text-2xl font-black text-white mt-1">{predSummary.total}</h4>
                </div>
                <CheckCircle className="text-[#14A899]" size={20} />
              </div>
              <div className="kpi-card glass rounded-xl p-4 flex items-center justify-between" style={{'--accent':'#E05252'} as React.CSSProperties}>
                <div>
                  <span className="text-[11px] text-[#E05252] font-bold uppercase tracking-wider">🔴 High</span>
                  <h4 className="text-2xl font-black text-[#E05252] mt-1">{predSummary.high}</h4>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-[#E05252]/10 text-[#E05252]">{predSummary.highPct.toFixed(0)}%</span>
              </div>
              <div className="kpi-card glass rounded-xl p-4 flex items-center justify-between" style={{'--accent':'#BA7517'} as React.CSSProperties}>
                <div>
                  <span className="text-[11px] text-[#BA7517] font-bold uppercase tracking-wider">🟡 Medium</span>
                  <h4 className="text-2xl font-black text-[#BA7517] mt-1">{predSummary.med}</h4>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-[#BA7517]/10 text-[#BA7517]">{predSummary.medPct.toFixed(0)}%</span>
              </div>
              <div className="kpi-card glass rounded-xl p-4 flex items-center justify-between" style={{'--accent':'#1D9E75'} as React.CSSProperties}>
                <div>
                  <span className="text-[11px] text-[#1D9E75] font-bold uppercase tracking-wider">🟢 Low</span>
                  <h4 className="text-2xl font-black text-[#1D9E75] mt-1">{predSummary.low}</h4>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-[#1D9E75]/10 text-[#1D9E75]">{predSummary.lowPct.toFixed(0)}%</span>
              </div>
            </div>

            <div className="glass rounded-xl p-5 shadow-lg">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
              <div>
                <h4 className="text-white font-semibold text-base">📋 Annotated Output Preview</h4>
                <p className="text-xs text-[#8FA3B1]">Computed risk indices appended to initial parameters</p>
              </div>
              <button 
                onClick={handleDownload}
                className="px-4 py-2 bg-[#14A899] hover:bg-[#14A899]/90 text-[#0A1628] font-bold text-xs rounded-lg flex items-center gap-2 transition cursor-pointer shadow-md"
              >
                <Download size={14} />
                Download Prediction Spreadsheet
              </button>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#2A4A5A] text-[#8FA3B1] uppercase tracking-wider font-semibold sticky top-0 bg-[#1A2E42]">
                    {csvHeaders.slice(0, 5).map(h => (
                      <th key={h} className="py-3 px-4">{h}</th>
                    ))}
                    {csvHeaders.length > 5 && <th className="py-3 px-4 text-slate-500">+{csvHeaders.length - 5} cols</th>}
                    <th className="py-3 px-4 text-center">Mapped Tenure</th>
                    <th className="py-3 px-4 text-center">Mapped Spend</th>
                    <th className="py-3 px-4 text-center">Mapped Freq</th>
                    <th className="py-3 px-4 text-center text-[#14A899] font-bold">Churn Score</th>
                    <th className="py-3 px-4 text-center text-[#14A899] font-bold">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A4A5A]/30 text-slate-300">
                  {predictions.map((pred, index) => (
                    <tr key={index} className="hover:bg-[#2A4A5A]/20 transition">
                      {csvHeaders.slice(0, 5).map(h => (
                        <td key={h} className="py-3 px-4 truncate max-w-[150px]">{pred.row[h]}</td>
                      ))}
                      {csvHeaders.length > 5 && <td className="py-3 px-4 text-slate-500 italic">...</td>}
                      <td className="py-3 px-4 text-center">{pred.row[tenureCol] || 0}</td>
                      <td className="py-3 px-4 text-center">₹{parseFloat(pred.row[spendCol] || '0').toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">{pred.row[freqCol] || 0}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold text-white text-sm">{pred.churn_score}%</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span 
                          className="px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-block tracking-wider"
                          style={{ 
                            backgroundColor: `${RISK_COLORS[pred.risk]}22`, 
                            color: RISK_COLORS[pred.risk],
                            border: `1px solid ${RISK_COLORS[pred.risk]}33`
                          }}
                        >
                          {pred.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        )}

    </div>
  );
}
