<template>
  <div class="audio-converter">
    <div class="header">
      <h1>WAV to MP3 Audio Converter</h1>
      <p class="subtitle">Convert audio formats in your browser using FFmpeg.wasm</p>
    </div>

    <div class="converter-container">
      <!-- File upload section -->
      <div class="upload-section">
        <div 
          class="upload-area" 
          @dragover.prevent="onDragOver"
          @dragleave.prevent="onDragLeave"
          @drop.prevent="onDrop"
          :class="{ 'drag-over': isDragOver }"
          @click="triggerFileInput"
        >
          <div class="upload-content">
            <div class="upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <h3>Click or drag WAV files here</h3>
            <p>Supports .wav format, maximum file size 100MB</p>
            <input 
              type="file" 
              ref="fileInput"
              @change="handleFileSelect"
              accept=".wav,audio/wav"
              hidden
            />
          </div>
        </div>
        
        <div class="selected-file" v-if="selectedFile">
          <div class="file-info">
            <div class="file-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <path d="M10 9H8v6h2a2 2 0 0 0 0-4h-2"/>
                <path d="M16 15v-2a2 2 0 1 0-4 0v2"/>
              </svg>
            </div>
            <div>
              <h4>{{ selectedFile.name }}</h4>
              <p>{{ formatFileSize(selectedFile.size) }} · WAV audio file</p>
            </div>
          </div>
          <button @click="removeFile" class="remove-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Conversion controls -->
      <div class="control-section">
        <div class="settings">
          <div class="setting-item">
            <label for="bitrate">MP3 Bitrate</label>
            <select id="bitrate" v-model="bitrate">
              <option value="128">128 kbps (Standard Quality)</option>
              <option value="192">192 kbps (Good Quality)</option>
              <option value="256">256 kbps (High Quality)</option>
              <option value="320">320 kbps (Best Quality)</option>
            </select>
          </div>
          
          <div class="setting-item">
            <label for="sampling-rate">Sampling Rate</label>
            <select id="sampling-rate" v-model="samplingRate">
              <option value="44100">44.1 kHz (CD Quality)</option>
              <option value="48000">48 kHz (DVD Quality)</option>
              <option value="22050">22.05 kHz</option>
            </select>
          </div>
        </div>
        
        <div class="action-buttons">
          <button 
            @click="convertAudio" 
            :disabled="!selectedFile || isConverting"
            class="convert-btn"
          >
            <span v-if="!isConverting">Convert WAV to MP3</span>
            <span v-else class="converting-text">
              <span class="spinner"></span>
              Converting...
            </span>
          </button>
          
          <button 
            @click="downloadResult" 
            :disabled="!convertedUrl"
            class="download-btn"
          >
            Download MP3 File
          </button>
        </div>
      </div>

      <!-- Status and results section -->
      <div class="result-section" v-if="convertedUrl || error">
        <div class="result-header">
          <h3>Conversion Results</h3>
        </div>
        
        <div class="result-content" v-if="convertedUrl">
          <div class="success-message">
            <div class="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div>
              <h4>Conversion Successful!</h4>
              <p>Your WAV file has been successfully converted to MP3 format</p>
            </div>
          </div>
          
          <div class="audio-preview">
            <h4>MP3 Preview</h4>
            <audio :src="convertedUrl" controls class="audio-player"></audio>
          </div>
          
          <div class="file-info-result">
            <div class="info-item">
              <span class="info-label">Original File:</span>
              <span class="info-value">{{ selectedFile?.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Original Size:</span>
              <span class="info-value">{{ formatFileSize(selectedFile?.size || 0) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Converted Size:</span>
              <span class="info-value">{{ formatFileSize(convertedSize) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Bitrate:</span>
              <span class="info-value">{{ bitrate }} kbps</span>
            </div>
            <div class="info-item">
              <span class="info-label">Conversion Time:</span>
              <span class="info-value">{{ conversionTime }} seconds</span>
            </div>
          </div>
        </div>
        
        <div class="error-message" v-if="error">
          <div class="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <h4>Conversion Failed</h4>
            <p>{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="progress-section" v-if="progress > 0 && progress < 100">
        <div class="progress-header">
          <h4>Conversion Progress</h4>
          <span>{{ progress.toFixed(1) }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
      </div>

      <!-- FFmpeg status information -->
      <div class="ffmpeg-status">
        <div class="status-item">
          <span class="status-label">FFmpeg Status:</span>
          <span class="status-value" :class="{
            'status-loading': ffmpegStatus === 'loading',
            'status-ready': ffmpegStatus === 'ready',
            'status-error': ffmpegStatus === 'error'
          }">
            {{ getStatusText(ffmpegStatus) }}
          </span>
        </div>
        <div class="status-item" v-if="logMessage">
          <span class="status-label">Log:</span>
          <span class="status-value">{{ logMessage }}</span>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="instructions">
      <h3>How to Use</h3>
      <ol>
        <li>Select or drag & drop a WAV audio file to the upload area</li>
        <li>Adjust MP3 bitrate and sampling rate settings as needed</li>
        <li>Click "Convert WAV to MP3" button to start conversion</li>
        <li>Wait for conversion to complete, then download the generated MP3 file</li>
      </ol>
      <p class="note">
        <strong>Note:</strong> The conversion process happens entirely in your browser - no files are uploaded to any server.
        Large files may take some time to convert, please be patient.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import ffmpegConfig from 'virtual:ffmpeg-config';

// Reactive data
const selectedFile = ref(null);
const isDragOver = ref(false);
const isConverting = ref(false);
const progress = ref(0);
const convertedUrl = ref(null);
const convertedSize = ref(0);
const conversionTime = ref(0);
const error = ref('');
const ffmpegStatus = ref('idle'); // idle, loading, ready, error
const logMessage = ref('');
const fileInput = ref(null);

// Conversion settings
const bitrate = ref('192');
const samplingRate = ref('44100');

const loadFFmpegObject = async (ffmpegObj) => {
  await ffmpegObj.load({
    coreURL: ffmpegConfig.coreURL,
    wasmURL: ffmpegConfig.wasmURL,
  });
}

// FFmpeg instance
const ffmpeg = new FFmpeg();

// Initialize FFmpeg
const initFFmpeg = async () => {
  try {
    ffmpegStatus.value = 'loading';
    logMessage.value = 'Loading FFmpeg...';
    
    // Listen to logs and progress
    ffmpeg.on('log', ({ message }) => {
      logMessage.value = message;
    });
    
    ffmpeg.on('progress', ({ progress: p }) => {
      progress.value = p * 100;
    });

    // Load FFmpeg
    await loadFFmpegObject(ffmpeg);
    
    ffmpegStatus.value = 'ready';
    logMessage.value = 'FFmpeg is ready. You can start conversion now.';
    
  } catch (err) {
    ffmpegStatus.value = 'error';
    error.value = `FFmpeg initialization failed: ${err.message}`;
    logMessage.value = `Error: ${err.message}`;
  }
};

// File selection handler
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Check file type
  if (!file.name.toLowerCase().endsWith('.wav') && file.type !== 'audio/wav') {
    error.value = 'Please select a WAV audio file';
    return;
  }
  
  // Check file size (limit to 100MB)
  if (file.size > 100 * 1024 * 1024) {
    error.value = 'File is too large. Please select a file smaller than 100MB';
    return;
  }
  
  selectedFile.value = file;
  convertedUrl.value = null;
  error.value = '';
  progress.value = 0;
};

// Drag and drop handlers
const onDragOver = () => {
  isDragOver.value = true;
};

const onDragLeave = () => {
  isDragOver.value = false;
};

const onDrop = (event) => {
  isDragOver.value = false;
  const file = event.dataTransfer.files[0];
  
  if (!file) return;
  
  // Simulate file input event
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  fileInput.value.files = dataTransfer.files;
  
  // Trigger change event
  const changeEvent = new Event('change', { bubbles: true });
  fileInput.value.dispatchEvent(changeEvent);
};

// Trigger file input
const triggerFileInput = () => {
  fileInput.value.click();
};

// Remove file
const removeFile = () => {
  selectedFile.value = null;
  convertedUrl.value = null;
  error.value = '';
  progress.value = 0;
  
  // Reset file input
  fileInput.value.value = '';
};

// Convert audio
const convertAudio = async () => {
  if (!selectedFile.value) {
    error.value = 'Please select a WAV file first';
    return;
  }
  
  if (ffmpegStatus.value !== 'ready') {
    error.value = 'FFmpeg is not ready yet. Please try again in a moment.';
    return;
  }
  
  try {
    isConverting.value = true;
    progress.value = 0;
    convertedUrl.value = null;
    error.value = '';
    logMessage.value = 'Starting audio conversion...';
    
    const startTime = Date.now();
    
    // Write file to FFmpeg filesystem
    const inputFileName = 'input.wav';
    const outputFileName = 'output.mp3';
    
    await ffmpeg.writeFile(inputFileName, await fetchFile(selectedFile.value));
    
    // Execute conversion command
    await ffmpeg.exec([
      '-i', inputFileName,
      '-codec:a', 'libmp3lame',
      '-b:a', `${bitrate.value}k`,
      '-ar', samplingRate.value,
      '-y', // Overwrite output file
      outputFileName
    ]);
    
    // Read converted file
    const data = await ffmpeg.readFile(outputFileName);
    
    // Create URL for preview and download
    const blob = new Blob([data], { type: 'audio/mpeg' });
    convertedUrl.value = URL.createObjectURL(blob);
    convertedSize.value = blob.size;
    
    // Calculate conversion time
    const endTime = Date.now();
    conversionTime.value = ((endTime - startTime) / 1000).toFixed(2);
    
    logMessage.value = `Conversion completed! Time taken: ${conversionTime.value} seconds`;
    
  } catch (err) {
    error.value = `Conversion failed: ${err.message}`;
    logMessage.value = `Error: ${err.message}`;
  } finally {
    isConverting.value = false;
  }
};

// Download result
const downloadResult = () => {
  if (!convertedUrl.value) return;
  
  const link = document.createElement('a');
  link.href = convertedUrl.value;
  link.download = selectedFile.value.name.replace(/\.wav$/i, '.mp3') || 'converted.mp3';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get status text
const getStatusText = (status) => {
  const statusMap = {
    'idle': 'Waiting for initialization',
    'loading': 'Loading...',
    'ready': 'Ready',
    'error': 'Error'
  };
  
  return statusMap[status] || status;
};

// Initialize FFmpeg when component mounts
onMounted(() => {
  initFFmpeg();
});
</script>

<style scoped>
.audio-converter {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 2.2rem;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.converter-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin-bottom: 30px;
}

.upload-section {
  margin-bottom: 25px;
}

.upload-area {
  border: 2px dashed #d1d8e0;
  border-radius: 10px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f8fafc;
}

.upload-area:hover, .upload-area.drag-over {
  border-color: #3498db;
  background-color: #e8f4fc;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.upload-icon {
  color: #7f8c8d;
}

.upload-area h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.upload-area p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.95rem;
}

.selected-file {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f1f8ff;
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
  border-left: 4px solid #3498db;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  color: #3498db;
}

.file-info h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.file-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background-color: rgba(231, 76, 60, 0.1);
}

.control-section {
  margin-bottom: 25px;
}

.settings {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 25px;
}

.setting-item {
  flex: 1;
  min-width: 200px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.setting-item select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #d1d8e0;
  border-radius: 6px;
  background-color: white;
  font-size: 1rem;
  color: #333;
  transition: border-color 0.3s;
}

.setting-item select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.convert-btn, .download-btn {
  flex: 1;
  padding: 15px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.convert-btn {
  background-color: #3498db;
  color: white;
}

.convert-btn:hover:not(:disabled) {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.convert-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.download-btn {
  background-color: #27ae60;
  color: white;
}

.download-btn:hover:not(:disabled) {
  background-color: #219955;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.download-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.converting-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.result-section {
  margin-top: 30px;
  padding: 20px;
  border-radius: 10px;
  background-color: #f9f9f9;
}

.result-header {
  margin-bottom: 20px;
}

.result-header h3 {
  margin: 0;
  color: #2c3e50;
}

.success-message, .error-message {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.success-message {
  background-color: rgba(39, 174, 96, 0.1);
  border-left: 4px solid #27ae60;
}

.error-message {
  background-color: rgba(231, 76, 60, 0.1);
  border-left: 4px solid #e74c3c;
}

.success-icon {
  color: #27ae60;
}

.error-icon {
  color: #e74c3c;
}

.success-message h4, .error-message h4 {
  margin: 0 0 5px 0;
}

.success-message p, .error-message p {
  margin: 0;
  color: #555;
}

.audio-preview {
  margin-bottom: 25px;
}

.audio-preview h4 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.audio-player {
  width: 100%;
  border-radius: 8px;
}

.file-info-result {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.info-label {
  font-weight: 600;
  color: #555;
}

.info-value {
  color: #2c3e50;
}

.progress-section {
  margin-top: 25px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.progress-header h4 {
  margin: 0;
  color: #2c3e50;
}

.progress-header span {
  color: #3498db;
  font-weight: 600;
}

.progress-bar {
  height: 10px;
  background-color: #ecf0f1;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #3498db;
  border-radius: 5px;
  transition: width 0.3s ease;
}

.ffmpeg-status {
  margin-top: 25px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  font-size: 0.9rem;
}

.status-item {
  display: flex;
  margin-bottom: 8px;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-label {
  font-weight: 600;
  min-width: 100px;
  color: #555;
}

.status-value {
  flex: 1;
  word-break: break-word;
}

.status-loading {
  color: #f39c12;
}

.status-ready {
  color: #27ae60;
}

.status-error {
  color: #e74c3c;
}

.instructions {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 25px;
}

.instructions h3 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 15px;
}

.instructions ol {
  padding-left: 20px;
  margin-bottom: 20px;
}

.instructions li {
  margin-bottom: 10px;
  color: #555;
}

.note {
  padding: 15px;
  background-color: #fff8e1;
  border-radius: 8px;
  color: #8a6d3b;
  font-size: 0.95rem;
  border-left: 4px solid #f39c12;
}

@media (max-width: 768px) {
  .converter-container {
    padding: 20px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .settings {
    flex-direction: column;
  }
  
  .file-info-result {
    grid-template-columns: 1fr;
  }
}
</style>
