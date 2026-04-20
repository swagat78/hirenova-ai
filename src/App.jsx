import React, { useState } from 'react';
import { Upload, FileText, File as FileIcon, Loader2, CheckCircle2, Download, RefreshCw, AlertCircle } from 'lucide-react';

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeInputType, setResumeInputType] = useState('upload'); // 'upload' or 'text'
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const ctaDisabled =
    !jobDescription.trim() ||
    (resumeInputType === 'upload' ? !resumeFile : !resumeText.trim());

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append('job_description', jobDescription);

      if (resumeInputType === 'upload' && resumeFile) {
        formData.append('resume_file', resumeFile);
      } else {
        formData.append('resume_text', resumeText);
      }

      const response = await fetch('/api/webhook-test/generate-resume', {
        method: 'POST',
        body: formData,
      });

      // Check if response is not ok OR if the content-type is json (which means it's an error message from n8n)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errData = await response.json();
        throw new Error(errData.message || errData.error || 'Failed to generate resume. Please check the workflow.');
      }

      if (!response.ok) {
        throw new Error('Failed to generate resume. Please try again.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);

    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setDownloadUrl(null);
    setIsGenerating(false);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100 transition-all duration-300">

        {/* Header Section */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center gap-3 justify-center">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">AI Resume Generator</h1>
          </div>
          <p className="text-center text-gray-500 mt-2 text-sm">Create an optimized and tailored resume in seconds.</p>
        </div>

        {/* Dynamic Content Area */}
        <div className="p-8">

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <span className="font-medium">Generation failed: </span>
                {error}
              </div>
            </div>
          )}

          {downloadUrl ? (

            /* Success State */
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-medium text-gray-800 mb-2">Resume Ready!</h2>
              <p className="text-gray-500 mb-8 max-w-sm">We've successfully tailored your resume for the new job description.</p>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <a
                  href={downloadUrl}
                  download="Optimized_Resume.pdf"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none"
                >
                  <Download className="w-4 h-4" />
                  Download Resume
                </a>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors border border-gray-200 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 outline-none"
                >
                  <RefreshCw className="w-4 h-4" />
                  Start Over
                </button>
              </div>
            </div>

          ) : isGenerating ? (

            /* Loading State */
            <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <h2 className="text-lg font-medium text-gray-800 mb-1">Generating your resume...</h2>
              <p className="text-gray-500 text-sm">This might take a few moments. We are working our AI magic.</p>
            </div>

          ) : (

            /* Input Form State */
            <div className="space-y-6 animate-in fade-in duration-300">

              {/* Job Description Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Job Description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full min-h-[140px] p-4 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-800 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-y placeholder:text-gray-400"
                />
              </div>

              {/* Resume Input Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Your Resume</label>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">

                  {/* Tabs */}
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setResumeInputType('upload')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${resumeInputType === 'upload' ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600 z-10' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                      <Upload className="w-4 h-4" />
                      Upload File
                    </button>
                    <button
                      onClick={() => setResumeInputType('text')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${resumeInputType === 'text' ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600 z-10' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                      <FileText className="w-4 h-4" />
                      Paste Text
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="p-4 bg-gray-50/30">
                    {resumeInputType === 'upload' ? (
                      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-lg bg-white group hover:border-blue-400 hover:bg-blue-50/30 transition-all text-center relative cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-label="Upload resume file"
                        />
                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                          <Upload className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                        </div>
                        {resumeFile ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-800">{resumeFile.name}</p>
                            <p className="text-xs text-gray-500">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX up to 10MB</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste your current resume content here..."
                        className="w-full min-h-[140px] p-4 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-y placeholder:text-gray-400"
                      />
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer CTA */}
        {(!downloadUrl && !isGenerating) && (
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <button
              onClick={handleGenerate}
              disabled={ctaDisabled}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gray-900 text-white rounded-xl font-medium shadow-sm hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
            >
              Generate Resume
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
