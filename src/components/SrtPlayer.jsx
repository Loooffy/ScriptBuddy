import React, { useState, useRef } from 'react';
import './SrtPlayer.css';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button,
  List,
  ListItem,
  ListItemText,
  Divider 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { keyframes } from '@mui/system';

const SrtPlayer = () => {
  const [mediaFile, setMediaFile] = useState(null);
  const [srtData, setSrtData] = useState([]);
  const [mediaFileName, setMediaFileName] = useState('');
  const [srtFileName, setSrtFileName] = useState('');
  const mediaRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Add fade-in animation
  const fadeIn = keyframes`
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `;

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    setMediaFile(URL.createObjectURL(file));
    setMediaFileName(file.name);
  };

  const handleSRTUpload = (e) => {
    const file = e.target.files[0];
    setSrtFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const srtText = event.target.result;
      const parsedSRT = parseSRT(srtText);
      setSrtData(parsedSRT);
    };
    reader.readAsText(file);
  };

  const parseSRT = (text) => {
    // First, normalize line endings and split into blocks
    const blocks = text.replace(/\r\n/g, '\n').split('\n\n');
    
    return blocks.map((block) => {
      // Split block into lines and remove empty lines
      const lines = block.split('\n').filter(line => line.trim());
      
      if (lines.length >= 3) {
        // First line is the index number
        const index = parseInt(lines[0]);
        
        // Second line is the timestamp - handle both . and , as millisecond separators
        const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2}[.,]\d{3}) --> (\d{2}:\d{2}:\d{2}[.,]\d{3})/);
        
        if (timeMatch) {
          const [, startTime, endTime] = timeMatch;
          const start = convertToSeconds(startTime);
          const end = convertToSeconds(endTime);
          
          // Join remaining lines as content in case of multi-line subtitles
          const content = lines.slice(2).join('\n');
          
          return {
            index,
            start,
            end,
            content,
            rawTime: lines[1]
          };
        }
      }
      return null;
    }).filter(Boolean);
  };

  const convertToSeconds = (timeStr) => {
    // Handle both . and , as millisecond separators
    const [time, milliseconds] = timeStr.split(/[.,]/);
    const [hours, minutes, seconds] = time.split(':').map(Number);
    // Use parseFloat for more precise decimal handling
    return parseFloat((hours * 3600 + minutes * 60 + seconds + parseInt(milliseconds) / 1000).toFixed(3));
  };

  const handleTextClick = (startTime) => {
    mediaRef.current.currentTime = startTime;
    mediaRef.current.play();
  };

  const handleTimeUpdate = () => {
    if (!mediaRef.current) return;
    
    const currentTime = parseFloat(mediaRef.current.currentTime.toFixed(3));
    const newActiveIndex = srtData.findIndex(
      item => currentTime >= item.start && currentTime <= item.end
    );
    
    if (newActiveIndex !== activeIndex) {
      setActiveIndex(newActiveIndex);
      if (newActiveIndex !== -1) {
        const element = document.getElementById(`srt-${srtData[newActiveIndex].index}`);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
          });
        }
      }
    }
  };

  const formatTime = (seconds) => {
    const pad = (num) => String(num).padStart(2, '0');
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}.${String(ms).padStart(3, '0')}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box component="div" sx={{ mb: 2 }}>

        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Step 1: Upload Audio/Video File
            </Typography>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              size="small"
            >
              Upload Media
              <input
                type="file"
                onChange={handleMediaUpload}
                hidden
              />
            </Button>
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Step 2: Upload Subtitle File
            </Typography>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              size="small"
            >
              Upload SRT
              <input
                type="file"
                accept=".srt"
                onChange={handleSRTUpload}
                hidden
              />
            </Button>
          </Box>
        </Paper>

        {mediaFile && (
          <Paper elevation={3} sx={{ p: 1, mb: 2 }}>
            {mediaFileName && (
              <Box sx={{ px: 1, mb: 1 }}>
                <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
                  Media File: 
                </Typography>
                <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                  {mediaFileName}
                </Typography>
              </Box>
            )}
            <video
              ref={mediaRef}
              controls
              onTimeUpdate={handleTimeUpdate}
              src={mediaFile}
              style={{ width: '100%', maxHeight: '40px' }}
            />
          </Paper>
        )}

        {srtData.length > 0 && (
          <Paper elevation={3}>
            {srtFileName && (
              <Box sx={{ p: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold' }}>
                  Subtitle File: 
                </Typography>
                <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                  {srtFileName}
                </Typography>
              </Box>
            )}
            <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
              <List dense>
                {srtData.map((item, index) => (
                  <React.Fragment key={item.index}>
                    <ListItem
                      id={`srt-${item.index}`}
                      button
                      onClick={() => handleTextClick(item.start)}
                      sx={{
                        cursor: 'pointer',
                        py: 0.5,
                        backgroundColor: activeIndex === index ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                        animation: activeIndex === index ? `${fadeIn} 0.3s ease-out` : 'none',
                        '&:hover': {
                          backgroundColor: activeIndex === index 
                            ? 'rgba(25, 118, 210, 0.12)' 
                            : 'rgba(0, 0, 0, 0.04)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        },
                        '&:active': {
                          backgroundColor: 'rgba(0, 0, 0, 0.08)',
                          transform: 'translateY(0)',
                        },
                        transition: 'all 0.2s ease',
                        borderLeft: activeIndex === index ? '4px solid #1976d2' : '4px solid transparent',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              opacity: activeIndex === index ? 1 : 0.7,
                              transition: 'opacity 0.3s ease'
                            }}
                          >
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              sx={{ minWidth: '25px' }}
                            >
                              {item.index}
                            </Typography>
                            <Box>
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                              >
                                {item.rawTime}
                              </Typography>
                              <Typography 
                                variant="body2"
                                sx={{
                                  fontWeight: activeIndex === index ? 500 : 400,
                                }}
                              >
                                {item.content}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < srtData.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default SrtPlayer;