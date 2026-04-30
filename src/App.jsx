import React, { useState } from 'react';
import { Upload, FileText, File as FileIcon, Loader2, CheckCircle2, Download, RefreshCw, AlertCircle, Edit3, User, Mail, Calendar, MapPin, Phone, Link, GraduationCap, Award, Maximize2, X } from 'lucide-react';

function App() {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isJdExpanded, setIsJdExpanded] = useState(false);
  const [resumeInputType, setResumeInputType] = useState('upload'); // 'upload', 'text', or 'manual'
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  // Manual Entry States
  const [phone, setPhone] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [college, setCollege] = useState('');
  const [collegeAddress, setCollegeAddress] = useState('');
  const [branch, setBranch] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const isValidGithub = github.trim() === '' || github.toLowerCase().includes('github.com');
  const isValidLinkedin = linkedin.trim() === '' || linkedin.toLowerCase().includes('linkedin.com');

  const manualFieldsFilled =
    phone.trim() !== '' &&
    github.trim() !== '' &&
    linkedin.trim() !== '' &&
    college.trim() !== '' &&
    collegeAddress.trim() !== '' &&
    branch.trim() !== '' &&
    cgpa.trim() !== '' &&
    startDate.trim() !== '' &&
    endDate.trim() !== '';

  const manualFieldsValid = manualFieldsFilled && isValidGithub && isValidLinkedin;

  const ctaDisabled =
    !userName.trim() ||
    !userEmail.trim() ||
    !jobDescription.trim() ||
    (resumeInputType === 'upload' && !resumeFile) ||
    (resumeInputType === 'text' && !resumeText.trim()) ||
    (resumeInputType === 'manual' && !manualFieldsValid);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append('user_name', userName);
      formData.append('user_email', userEmail);
      formData.append('job_description', jobDescription);

      if (resumeInputType === 'upload' && resumeFile) {
        formData.append('resume_file', resumeFile);
      } else if (resumeInputType === 'text') {
        const enrichedText = `Name: ${userName}\nEmail: ${userEmail}\n\n${resumeText}`;
        formData.append('resume_text', enrichedText);
      } else if (resumeInputType === 'manual') {
        const manualData = `
Personal Details:
Phone: +91 ${phone}
GitHub: ${github}
LinkedIn: ${linkedin}

Education:
College Name: ${college}
College Address: ${collegeAddress}
Timeline: ${startDate} - ${endDate}
Branch/Major: ${branch}
CGPA: ${cgpa}
        `.trim();
        formData.append('resume_text', manualData);
        formData.append('phone', `+91 ${phone}`);
        formData.append('github', github);
        formData.append('linkedin', linkedin);
        formData.append('college', college);
        formData.append('college_address', collegeAddress);
        formData.append('start_date', startDate);
        formData.append('end_date', endDate);
        formData.append('cgpa', cgpa);
        formData.append('branch', branch);
      }

      // Fire and forget! We don't care if Netlify times out at 30 seconds, 
      // because n8n keeps working securely in the background for 2 minutes!
      const response = await fetch('/api/webhook/generate-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to start the resume generation. Please try again.');
      }

      // n8n responds instantly with the new Database Row ID!
      const responseData = await response.json();
      const jobId = responseData.job_id;

      // Start Polling for the PDF URL
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/webhook/status?job_id=${jobId}`);
          if (statusRes.ok) {
            const data = await statusRes.json();

            // Wait until the Supabase node updates the row to success
            if (data.status === 'success' && data.pdf_url) {
              clearInterval(pollInterval);
              setDownloadUrl(data.pdf_url);
              setIsGenerating(false); // Stop loading ONLY when PDF is ready
            }
          }
        } catch (e) {
          // Ignore network errors while polling
        }
      }, 5000); // Check every 5 seconds

    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setDownloadUrl(null);
    setIsGenerating(false);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505] relative overflow-hidden selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
      
      {/* JD Enlarge Modal */}
      {isJdExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#1a1a1a]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Maximize2 className="w-5 h-5 text-orange-400" />
                Edit Job Description
              </h2>
              <button onClick={() => setIsJdExpanded(false)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="flex-1 w-full p-6 bg-transparent text-white text-base sm:text-lg focus:outline-none resize-none placeholder:text-slate-500 font-medium leading-relaxed"
              autoFocus
            />
            <div className="p-4 border-t border-white/10 bg-[#1a1a1a] flex justify-end">
              <button onClick={() => setIsJdExpanded(false)} className="px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attractive Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/20 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-3xl bg-[#111111]/80 backdrop-blur-2xl rounded-3xl shadow-2xl ring-1 ring-white/10 overflow-hidden transition-all duration-300 relative z-10">

        {/* Header Section */}
        <div className="p-8 pb-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
          <div className="flex flex-col items-center gap-4 justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#111] flex items-center justify-center shadow-lg shadow-fuchsia-500/20 ring-1 ring-white/20 overflow-hidden p-2">
              <img src="/hirenova_logo.png" alt="Hirenova Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 tracking-tight">Hire Nova</h1>
              <p className="text-slate-400 mt-1.5 text-sm font-medium">AI Resume Generator</p>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="p-8">

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm text-red-200">
                <span className="font-medium text-red-400">Generation failed: </span>
                {error}
              </div>
            </div>
          )}

          {downloadUrl ? (

            /* Success State */
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-green-500/20">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-medium text-white mb-2">Resume Ready!</h2>
              <p className="text-slate-400 mb-8 max-w-sm">We've successfully tailored your resume for the new job description.</p>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <a
                  href={downloadUrl}
                  download="Optimized_Resume.pdf"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-all shadow-lg shadow-white/10 focus:ring-4 focus:ring-white/20 outline-none"
                >
                  <Download className="w-4 h-4" />
                  Download Resume
                </a>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1a1a1a] text-white rounded-xl font-medium hover:bg-[#222] transition-all border border-white/10 shadow-sm focus:ring-4 focus:ring-white/10 outline-none"
                >
                  <RefreshCw className="w-4 h-4" />
                  Start Over
                </button>
              </div>
            </div>

          ) : isGenerating ? (

            /* Loading State */
            <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
              <Loader2 className="w-10 h-10 text-fuchsia-500 animate-spin mb-4" />
              <h2 className="text-lg font-medium text-white mb-1">Generating your resume...</h2>
              <p className="text-slate-400 text-sm">This might take a few moments. We are working our AI magic.</p>
            </div>

          ) : (

            /* Input Form State */
            <div className="space-y-8 animate-in fade-in duration-300">

              {/* Global User Details */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Basic Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-violet-400" />
                    </div>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Hire Nova"
                      className="pl-10 w-full p-3.5 rounded-xl border border-white/10 bg-[#1a1a1a] text-white text-sm focus:bg-[#222] focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all outline-none placeholder:text-slate-500 font-medium"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-fuchsia-400" />
                    </div>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="pl-10 w-full p-3.5 rounded-xl border border-white/10 bg-[#1a1a1a] text-white text-sm focus:bg-[#222] focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 transition-all outline-none placeholder:text-slate-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Job Description Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Job Description</h2>
                </div>
                <div className="relative group">
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste job description..."
                    className="w-full min-h-[120px] p-4 pr-12 rounded-xl border border-white/10 bg-[#1a1a1a] text-white text-sm focus:bg-[#222] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all outline-none resize-y placeholder:text-slate-500 font-medium leading-relaxed"
                  />
                  <button 
                    onClick={() => setIsJdExpanded(true)}
                    type="button"
                    className="absolute top-3 right-3 p-1.5 bg-[#222] hover:bg-orange-500/20 text-slate-400 hover:text-orange-400 border border-white/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Enlarge editor"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Resume Input Area */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                  <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Your Content</h2>
                  <span className="text-xs font-medium text-fuchsia-400/90 bg-fuchsia-500/10 px-2 py-1 rounded-md border border-fuchsia-500/20 w-fit">
                    For best results, use the Upload File tab
                  </span>
                </div>

                <div className="rounded-2xl p-1.5 bg-[#1a1a1a] border border-white/5">
                  {/* Pill Tabs */}
                  <div className="flex gap-1 mb-1.5">
                    <button
                      onClick={() => setResumeInputType('upload')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm rounded-xl transition-all duration-200 ${resumeInputType === 'upload' ? 'bg-[#2a2a2a] text-white shadow-sm font-semibold ring-1 ring-white/10' : 'text-slate-400 hover:text-white hover:bg-[#222] font-medium'}`}
                    >
                      <Upload className="w-4 h-4" />
                      <span className="hidden sm:inline">Upload File</span>
                      <span className="sm:hidden">File</span>
                    </button>
                    <button
                      onClick={() => setResumeInputType('text')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm rounded-xl transition-all duration-200 ${resumeInputType === 'text' ? 'bg-[#2a2a2a] text-white shadow-sm font-semibold ring-1 ring-white/10' : 'text-slate-400 hover:text-white hover:bg-[#222] font-medium'}`}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">Paste Text</span>
                      <span className="sm:hidden">Text</span>
                    </button>
                    <button
                      onClick={() => setResumeInputType('manual')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm rounded-xl transition-all duration-200 ${resumeInputType === 'manual' ? 'bg-white text-black shadow-sm font-bold ring-1 ring-white/20' : 'text-slate-400 hover:text-white hover:bg-[#222] font-medium'}`}
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="hidden sm:inline">Build From Scratch</span>
                      <span className="sm:hidden">Create</span>
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="bg-[#111] rounded-xl p-4 shadow-sm ring-1 ring-white/5">
                    {resumeInputType === 'upload' ? (
                      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-xl bg-[#1a1a1a] group hover:border-violet-500 hover:bg-violet-500/5 transition-all text-center relative cursor-pointer">
                        <div className="w-12 h-12 bg-[#222] shadow-sm ring-1 ring-white/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors group-hover:scale-105 duration-200">
                          <Upload className="w-5 h-5 text-slate-400 group-hover:text-violet-400" />
                        </div>
                        {resumeFile ? (
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-violet-400">{resumeFile.name}</p>
                            <p className="text-xs font-medium text-slate-500">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-semibold text-slate-300">Click to upload or drag and drop</p>
                            <p className="text-xs font-medium text-slate-500 mt-1">PDF files up to 10MB</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label="Upload resume file"
                        />
                      </div>
                    ) : resumeInputType === 'text' ? (
                      <div className="space-y-3 animate-in fade-in duration-300">
                        <div className="flex items-start gap-3 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-sm text-violet-200 font-medium">
                          <AlertCircle className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                          <p><strong>Alternative Option:</strong> If file upload isn't working, simply copy all the text from your existing PDF resume and paste it below.</p>
                        </div>
                        <textarea
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          placeholder="Paste your extracted resume text here..."
                          className="w-full min-h-[140px] p-4 rounded-xl border border-white/10 bg-[#1a1a1a] text-white text-sm focus:bg-[#222] focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all outline-none resize-y placeholder:text-slate-500 font-medium"
                        />
                      </div>
                    ) : (
                      <div className="space-y-5 animate-in fade-in duration-300">
                        <div className="text-center px-4 py-2">
                          <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Build from Scratch</h3>
                          <p className="text-xs font-medium text-slate-400 mt-1.5 leading-relaxed">Fill in ALL these details to generate a stunning resume instantly. <span className="text-fuchsia-400">Every field is required.</span></p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">

                          {/* Phone Number */}
                          <div className="relative col-span-1 sm:col-span-2">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <span className="text-lg mr-1.5 leading-none">🇮🇳</span>
                              <span className="text-slate-400 text-sm font-medium border-r border-white/10 pr-2 mr-2">+91</span>
                            </div>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-[5.5rem] w-full p-3.5 rounded-xl border border-white/10 bg-[#1a1a1a] text-white text-sm focus:bg-[#222] focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all outline-none font-medium" />
                          </div>

                          {/* Social Links */}
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Link className="h-4 w-4 text-slate-500" />
                            </div>
                            <input type="text" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="GitHub Profile Link" className={`pl-10 w-full p-3.5 rounded-xl border bg-[#1a1a1a] text-white text-sm focus:bg-[#222] focus:ring-4 transition-all outline-none placeholder:text-slate-500 font-medium ${github && !isValidGithub ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-fuchsia-500 focus:ring-fuchsia-500/20'}`} />
                          </div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Link className="h-4 w-4 text-slate-500" />
                            </div>
                            <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn Profile Link" className={`pl-10 w-full p-3.5 rounded-xl border bg-[#1a1a1a] text-white text-sm focus:bg-[#222] focus:ring-4 transition-all outline-none placeholder:text-slate-500 font-medium ${linkedin && !isValidLinkedin ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-fuchsia-500 focus:ring-fuchsia-500/20'}`} />
                          </div>

                          {/* College Details */}
                          <div className="relative col-span-1 sm:col-span-2">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <GraduationCap className="h-4 w-4 text-slate-500" />
                            </div>
                            <input type="text" value={college} onChange={(e) => setCollege(e.target.value)} placeholder="College / University Name" className="pl-10 w-full p-3.5 rounded-xl border border-white/10 bg-[#1a1a1a] text-white text-sm focus:bg-[#222] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all outline-none placeholder:text-slate-500 font-medium" />
                          </div>

                          <div className="relative col-span-1 sm:col-span-2">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <MapPin className="h-4 w-4 text-slate-500" />
                            </div>
                            <input type="text" value={collegeAddress} onChange={(e) => setCollegeAddress(e.target.value)} placeholder="College Address (City, State)" className="pl-10 w-full p-3.5 rounded-xl border border-white/10 bg-[#1a1a1a] text-white text-sm focus:bg-[#222] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all outline-none placeholder:text-slate-500 font-medium" />
                          </div>

                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Calendar className="h-4 w-4 text-slate-500" />
                            </div>
                            <input type="month" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="pl-10 w-full p-3.5 rounded-xl border border-white/10 bg-[#1a1a1a] text-white text-sm focus:bg-[#222] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all outline-none font-medium" />
                          </div>

                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Calendar className="h-4 w-4 text-slate-500" />
                            </div>
                            <input type="month" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="pl-10 w-full p-3.5 rounded-xl border border-white/10 bg-[#1a1a1a] text-white text-sm focus:bg-[#222] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all outline-none font-medium" />
                          </div>

                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Award className="h-4 w-4 text-slate-500" />
                            </div>
                            <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="Branch (e.g., Computer Science)" className="pl-10 w-full p-3.5 rounded-xl border border-white/10 bg-[#1a1a1a] text-white text-sm focus:bg-[#222] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all outline-none placeholder:text-slate-500 font-medium" />
                          </div>

                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Award className="h-4 w-4 text-slate-500" />
                            </div>
                            <input type="text" value={cgpa} onChange={(e) => setCgpa(e.target.value)} placeholder="CGPA (e.g., 8.5/10)" className="pl-10 w-full p-3.5 rounded-xl border border-white/10 bg-[#1a1a1a] text-white text-sm focus:bg-[#222] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all outline-none placeholder:text-slate-500 font-medium" />
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer CTA */}
        {(!downloadUrl && !isGenerating) && (
          <div className="p-6 bg-[#151515] border-t border-white/5 relative overflow-hidden">
            <button
              onClick={handleGenerate}
              disabled={ctaDisabled}
              className="w-full relative z-10 flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 text-white rounded-2xl font-semibold shadow-lg shadow-fuchsia-500/25 hover:opacity-90 focus:ring-4 focus:ring-fuchsia-500/30 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-base"
            >
              Generate Resume
            </button>
            <div className="text-center mt-4 relative z-10">
              <p className="text-xs text-slate-500 font-medium">
                Experiencing any issues? Email us at <a href="mailto:hirenovai@gmail.com" className="text-violet-400 hover:text-violet-300 transition-colors">hirenovai@gmail.com</a>
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
