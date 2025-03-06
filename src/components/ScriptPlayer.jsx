import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  CssBaseline,
  GlobalStyles,
  Modal,
  Fade,
  Backdrop
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { keyframes } from '@mui/system';
import { ThemeProvider } from '@mui/material/styles';
import darkTheme from '../theme/darkTheme';
import { Link } from 'react-router-dom';

// Define fadeIn animation
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const ScriptPlayer = () => {
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaFileName, setMediaFileName] = useState('');
  const [scriptData, setScriptData] = useState([]);
  const [scriptFileName, setScriptFileName] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const mediaRef = useRef(null);
  const listItemRefs = useRef([]);
  
  const handleOpenUploadModal = () => setUploadModalOpen(true);
  const handleCloseUploadModal = () => setUploadModalOpen(false);
  
  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };
  
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    const loadDefaultScript = async () => {
      try {
        const response = await fetch('./scripts/whole_scripts.json');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        const parsedData = parseJsonTranscript(jsonData);
        setScriptData(parsedData);
        setScriptFileName('whole_scripts.json');
        return true;
      } catch (error) {
        console.error("Error loading default script:", error);
        setError("Failed to load script file. " + error.message);
        return false;
      }
    };
    
    const loadDefaultAudio = () => {
      try {
        const audioPath = './audio/whole_scripts.mp3';
        setMediaFile(audioPath);
        setMediaFileName('whole_scripts.mp3');
        return true;
      } catch (error) {
        console.error("Error loading default audio:", error);
        setError("Failed to load audio file. " + error.message);
        return false;
      }
    };
    
    const loadFiles = async () => {
      const scriptLoaded = await loadDefaultScript();
      const audioLoaded = loadDefaultAudio();
      
      setIsLoading(false);
      
      if (!scriptLoaded || !audioLoaded) {
        // If either file failed to load, show the upload modal
        handleOpenUploadModal();
      }
    };
    
    loadFiles();
  }, []);
  
  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      const currentTime = mediaRef.current.currentTime;
      setCurrentTime(currentTime);
      
      // Find the active sentence based on current time
      const activeIndex = scriptData.findIndex(item => 
        currentTime >= item.start && currentTime <= item.end
      );
      
      if (activeIndex !== -1 && activeIndex !== activeIndex) {
        setActiveIndex(activeIndex);
        
        if (listItemRefs.current[activeIndex]) {
          listItemRefs.current[activeIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
    }
  };
  
  const handleTextClick = (startTime) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = startTime;
      mediaRef.current.play();
    }
  };
  
  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(URL.createObjectURL(file));
      setMediaFileName(file.name);
    }
  };
  
  const handleScriptUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setScriptFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const fileContent = event.target.result;
      
      // Check if the file is JSON format
      if (file.name.endsWith('.json')) {
        try {
          const jsonData = JSON.parse(fileContent);
          const parsedData = parseJsonTranscript(jsonData);
          setScriptData(parsedData);
          // Close the modal after successful upload
          handleCloseUploadModal();
        } catch (error) {
          console.error("Error parsing JSON:", error);
          setError("Invalid JSON file format. " + error.message);
        }
      } else {
        // Handle traditional script format
        try {
          const parsedScript = parseScript(fileContent);
          setScriptData(parsedScript);
          // Close the modal after successful upload
          handleCloseUploadModal();
        } catch (error) {
          console.error("Error parsing script:", error);
          setError("Failed to parse script file. " + error.message);
        }
      }
    };
    
    reader.onerror = () => {
      setError("Failed to read the file.");
    };
    
    reader.readAsText(file);
  };
  
  const parseJsonTranscript = (jsonData) => {
    // Check if we have a direct array of words
    if (Array.isArray(jsonData)) {
      const words = jsonData;
      
      // Group words into sentences
      const sentences = [];
      let currentSentence = null;
      let sentenceIndex = 1;
      
      words.forEach((word, index) => {
        // Skip spacing type entries when determining sentence boundaries
        if (word.type === 'spacing') {
          if (currentSentence) {
            currentSentence.words.push(word);
            currentSentence.end = word.end;
          }
          return;
        }
        
        // Check if this is a new speaker or first word
        const speakerId = word.speaker_id || null;
        const speakerName = word.speaker_name || null;
        
        // Start a new sentence if:
        // 1. We don't have a current sentence yet
        // 2. The speaker changed
        // 3. The word ends with sentence-ending punctuation
        // 4. The previous word ended with sentence-ending punctuation
        const isPunctuation = word.text && word.text.match(/[.!?]$/);
        const isPreviousPunctuation = index > 0 && 
          words[index-1].text && 
          words[index-1].text.match(/[.!?]$/);
        const isSpeakerChange = currentSentence && 
          currentSentence.speaker_id !== speakerId;
        
        if (!currentSentence || isSpeakerChange || isPunctuation || isPreviousPunctuation) {
          // If we have a current sentence, add it to our sentences array
          if (currentSentence && currentSentence.words.length > 0) {
            sentences.push({
              index: sentenceIndex++,
              start: currentSentence.start,
              end: currentSentence.end,
              content: currentSentence.words.map(w => w.text).join(''),
              speaker: currentSentence.speaker_id,
              speaker_name: currentSentence.speaker_name,
              rawTime: `${formatTime(currentSentence.start)} --> ${formatTime(currentSentence.end)}`,
              words: currentSentence.words
            });
          }
          
          // Start a new sentence
          currentSentence = {
            words: [word],
            start: word.start,
            end: word.end,
            speaker_id: speakerId,
            speaker_name: speakerName
          };
        } else {
          // Add to current sentence
          currentSentence.words.push(word);
          currentSentence.end = word.end;
        }
      });
      
      // Add the final sentence if there is one
      if (currentSentence && currentSentence.words.length > 0) {
        sentences.push({
          index: sentenceIndex,
          start: currentSentence.start,
          end: currentSentence.end,
          content: currentSentence.words.map(w => w.text).join(''),
          speaker: currentSentence.speaker_id,
          speaker_name: currentSentence.speaker_name,
          rawTime: `${formatTime(currentSentence.start)} --> ${formatTime(currentSentence.end)}`,
          words: currentSentence.words
        });
      }
      
      return sentences;
    } 
    // Check if we have a words array in the JSON object
    else if (jsonData && jsonData.words && Array.isArray(jsonData.words)) {
      const sentences = [];
      let currentSentence = null;
      let sentenceIndex = 1;
      
      jsonData.words.forEach((word, index) => {
        // Check if this is a new speaker or first word
        const speakerId = word.speaker_id || null;
        const speakerName = word.speaker_name || null;
        
        // Start a new sentence if:
        // 1. We don't have a current sentence yet
        // 2. The speaker changed
        // 3. The word ends with sentence-ending punctuation
        // 4. The previous word ended with sentence-ending punctuation
        const isPunctuation = word.text && word.text.match(/[.!?]$/);
        const isPreviousPunctuation = index > 0 && 
          jsonData.words[index-1].text && 
          jsonData.words[index-1].text.match(/[.!?]$/);
        const isSpeakerChange = currentSentence && 
          currentSentence.speaker_id !== speakerId;
        
        if (!currentSentence || isSpeakerChange || isPunctuation || isPreviousPunctuation) {
          // If we have a current sentence, add it to our sentences array
          if (currentSentence && currentSentence.words.length > 0) {
            sentences.push({
              index: sentenceIndex++,
              start: currentSentence.start,
              end: currentSentence.end,
              content: currentSentence.words.map(w => w.text).join(''),
              speaker: currentSentence.speaker_id,
              speaker_name: currentSentence.speaker_name,
              rawTime: `${formatTime(currentSentence.start)} --> ${formatTime(currentSentence.end)}`,
              words: currentSentence.words
            });
          }
          
          // Start a new sentence
          currentSentence = {
            words: [word],
            start: word.start,
            end: word.end,
            speaker_id: speakerId,
            speaker_name: speakerName
          };
        } else {
          // Add to current sentence
          currentSentence.words.push(word);
          currentSentence.end = word.end;
        }
      });
      
      // Add the final sentence if there is one
      if (currentSentence && currentSentence.words.length > 0) {
        sentences.push({
          index: sentenceIndex,
          start: currentSentence.start,
          end: currentSentence.end,
          content: currentSentence.words.map(w => w.text).join(''),
          speaker: currentSentence.speaker_id,
          speaker_name: currentSentence.speaker_name,
          rawTime: `${formatTime(currentSentence.start)} --> ${formatTime(currentSentence.end)}`,
          words: currentSentence.words
        });
      }
      
      return sentences;
    } else {
      throw new Error("Invalid JSON format: missing words array");
    }
  };
  
  // Parse traditional script format
  const parseScript = (content) => {
    // Simple parsing logic for demonstration
    const lines = content.split('\n');
    const parsedData = [];
    
    let currentIndex = 1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('-->')) {
        const timeParts = line.split('-->');
        const startTime = parseTimeString(timeParts[0].trim());
        const endTime = parseTimeString(timeParts[1].trim());
        
        const contentLine = lines[i+1]?.trim();
        if (contentLine) {
          parsedData.push({
            index: currentIndex++,
            start: startTime,
            end: endTime,
            content: contentLine,
            rawTime: line,
            speaker: null,
            speaker_name: null
          });
        }
        i++; // Skip the content line
      }
    }
    
    return parsedData;
  };
  
  // Parse time string (e.g., "00:01:23.456") to seconds
  const parseTimeString = (timeStr) => {
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      return (
        parseInt(hours) * 3600 +
        parseInt(minutes) * 60 +
        parseFloat(seconds)
      );
    }
    return 0;
  };
  
  // New function to determine if a word is currently being spoken
  const isWordActive = (word, currentTime) => {
    return currentTime >= word.start && currentTime <= word.end;
  };
  
  // Add a new function to handle word click
  const handleWordClick = (startTime, event) => {
    // Prevent the click from bubbling up to the ListItem
    event.stopPropagation();
    
    if (mediaRef.current) {
      mediaRef.current.currentTime = startTime;
      mediaRef.current.play();
    }
  };
  
  const getSpeakerColor = (speakerId) => {
    const colors = {
      'Narrator': '#ff6b6b',
      'Anger': '#e74c3c',
      'Sadness': '#3498db',
      'Joy': '#f1c40f',
    };
    
    return colors[speakerId] || colors[speakerId.toString()] || '#ff6b6b';
  };
  
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      
      <Box sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Box sx={{ 
          padding: '16px 0',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <Container maxWidth="lg">
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              animation: `${fadeIn} 1s ease-out`
            }}>
              {/* Logo and title in a row */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1
              }}>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  <Box 
                    component="img"
                    src="./images/logo.png"
                    alt="Script Player Logo"
                    sx={{ 
                      height: '40px',
                      mr: 2,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }}
                  />
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{ 
                      fontWeight: 700,
                      color: '#fff',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    ScriptBuddy
                  </Typography>
                </Link>
              </Box>
              
              <Typography 
                variant="subtitle2" 
                color="text.secondary"
                sx={{
                  textAlign: 'center',
                  mt: 0.5,
                }}
              >
                Practice makes perfect~
              </Typography>
            </Box>
          </Container>
        </Box>
        
          <Container maxWidth="lg" sx={{ mb: 4 }}>
            {/* Loading state */}
            {isLoading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography>Loading script and audio files...</Typography>
              </Box>
            )}
            
            {/* Error message */}
            {error && (
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.dark' }}>
                <Typography color="error.contrastText">{error}</Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 1 }}
                  onClick={handleOpenUploadModal}
                >
                  Upload Files Manually
                </Button>
              </Paper>
            )}
            
            {/* Upload Modal */}
            <Modal
              open={uploadModalOpen}
              onClose={handleCloseUploadModal}
              closeAfterTransition
              slots={{
                backdrop: Backdrop,
              }}
              slotProps={{
                backdrop: {
                  timeout: 500,
                },
              }}
            >
              <Fade in={uploadModalOpen}>
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '60%',
                  maxWidth: '600px',
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  boxShadow: 24,
                  p: 4,
                }}>
                  <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                    Upload Files
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Media File (MP3, WAV)
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mr: 2 }}
                      >
                        Upload Media
                        <input
                          type="file"
                          accept="audio/*"
                          hidden
                          onChange={handleMediaUpload}
                        />
                      </Button>
                      <Typography variant="body2">
                        {mediaFileName || "No file selected"}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Script File (JSON)
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mr: 2 }}
                      >
                        Upload Script
                        <input
                          type="file"
                          accept=".json,.txt,.srt,.vtt"
                          hidden
                          onChange={handleScriptUpload}
                        />
                      </Button>
                      <Typography variant="body2">
                        {scriptFileName || "No file selected"}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button onClick={handleCloseUploadModal} sx={{ mr: 2 }}>
                      Cancel
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={handleCloseUploadModal}
                      disabled={!mediaFile || scriptData.length === 0}
                    >
                      Done
                    </Button>
                  </Box>
                </Box>
              </Fade>
            </Modal>

            {/* Script data section */}
            {scriptData.length > 0 && (
              <Paper elevation={3} sx={{ mb: 2 }}>
                {scriptFileName && (
                  <Box sx={{ 
                    p: 1.5, 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" component="span" sx={{ 
                        fontWeight: 700,
                        color: '#d0cfcd'
                      }}>
                        Subtitle File:
                      </Typography>
                      <Typography variant="body2" component="span" sx={{ 
                        color: '#d0cfcd',
                        opacity: 0.8 
                      }}>
                        {scriptFileName}
                      </Typography>
                    </Box>
                    
                    {/* Change Files button */}
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<UploadFileIcon />}
                      onClick={handleOpenUploadModal}
                      sx={{
                        borderRadius: 1.5,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        },
                      }}
                    >
                      Change Files
                    </Button>
                  </Box>
                )}
                <Box sx={{ 
                  maxHeight: 'calc(100vh - 200px)',
                  overflow: 'auto',
                  width: '100%',
                  scrollBehavior: 'smooth',
                  p: 2,
                  '&::-webkit-scrollbar': {
                    width: '6px',
                    backgroundColor: 'transparent',
                  },
                  '&::-webkit-scrollbar-track': {
                    borderRadius: '10px',
                    backgroundColor: 'rgba(30, 30, 30, 0.2)',
                    margin: '4px 0',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    borderRadius: '10px',
                    backgroundColor: 'rgba(100, 100, 100, 0.4)',
                    border: '1px solid rgba(100, 100, 100, 0.1)',
                    transition: 'all 0.2s ease',
                  },
                  '&:hover::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(120, 120, 120, 0.5)',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: 'rgba(150, 150, 150, 0.6)',
                  },
                  '&::-webkit-scrollbar-thumb:active': {
                    backgroundColor: 'rgba(180, 180, 180, 0.7)',
                  },
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(100, 100, 100, 0.4) rgba(30, 30, 30, 0.2)',
                }}>
                  {(() => {
                    // Process script data to combine consecutive sentences from the same speaker
                    const processedData = [];
                    let currentSpeaker = null;
                    let currentGroup = null;
                    
                    scriptData.forEach((item) => {
                      const speakerId = `${item.speaker || ''}:${item.speaker_name || ''}`;
                      
                      if (!currentSpeaker || currentSpeaker !== speakerId) {
                        // Start a new group
                        if (currentGroup) {
                          processedData.push(currentGroup);
                        }
                        
                        currentGroup = {
                          speaker: item.speaker,
                          speaker_name: item.speaker_name,
                          sentences: [item]
                        };
                        currentSpeaker = speakerId;
                      } else {
                        // Add to current group
                        currentGroup.sentences.push(item);
                      }
                    });
                    
                    // Add the last group
                    if (currentGroup) {
                      processedData.push(currentGroup);
                    }
                    
                    return processedData.map((group, groupIndex) => (
                      <Box 
                        key={groupIndex} 
                        sx={{ 
                          display: 'flex',
                          borderBottom: groupIndex < processedData.length - 1 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                        }}
                      >
                        {/* Speaker information in left column - simplified */}
                        <Box sx={{ 
                          width: '120px', 
                          p: 2,
                          display: 'flex',
                          alignItems: 'flex-start',
                        }}>
                          <Typography 
                            variant="subtitle2" 
                            component="span"
                            sx={{ 
                              color: getSpeakerColor(group.speaker || groupIndex),
                              fontWeight: 500,
                              fontSize: '0.85rem',
                            }}
                          >
                            {group.speaker || group.speaker === 0 ? group.speaker : groupIndex}
                          </Typography>
                        </Box>
                        
                        {/* Content in right column */}
                        <Box sx={{ 
                          flex: 1, 
                          p: 2,
                          borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                        }}>
                          <Typography 
                            variant="body1" 
                            component="div"
                            sx={{ 
                              color: '#c0c0c0',
                              lineHeight: 1.2,
                              textAlign: 'left',
                              fontSize: '0.9rem',
                            }}
                          >
                            {group.sentences.map((sentence, sentenceIndex) => (
                              <Box
                                key={sentenceIndex}
                                onClick={() => handleTextClick(sentence.start)}
                                sx={{
                                  cursor: 'pointer',
                                  display: 'inline',
                                }}
                              >
                                {sentence.words && Array.isArray(sentence.words) ? (
                                  sentence.words.map((word, wordIndex) => {
                                    // Check if this is a spacing type or if the word has a space after it
                                    const isSpace = word.type === 'spacing';
                                    const needsSpace = !isSpace && wordIndex < sentence.words.length - 1 && 
                                                      sentence.words[wordIndex + 1].type !== 'spacing' &&
                                                      !word.text.match(/[.,!?]$/);
                                    
                                    return isSpace ? (
                                      // For spacing type, just render a space
                                      <span key={wordIndex}> </span>
                                    ) : (
                                      // For regular words
                                      <React.Fragment key={wordIndex}>
                                        <Box
                                          component="span"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleWordClick(word.start, e);
                                          }}
                                          sx={{
                                            cursor: 'pointer',
                                            backgroundColor: isWordActive(word, currentTime) 
                                              ? 'rgba(255, 255, 255, 0.2)' 
                                              : 'transparent',
                                            borderRadius: '2px',
                                            transition: 'background-color 0.2s',
                                            display: 'inline-block',
                                            position: 'relative',
                                            '&:hover': {
                                              backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                            },
                                            // Prevent hover effect from affecting adjacent words
                                            '&::after': {
                                              content: '""',
                                              position: 'absolute',
                                              top: 0,
                                              left: 0,
                                              right: 0,
                                              bottom: 0,
                                              pointerEvents: 'none',
                                            }
                                          }}
                                        >
                                          {word.text}
                                        </Box>
                                        {/* Add space after word if needed */}
                                        {needsSpace && ' '}
                                      </React.Fragment>
                                    );
                                  })
                                ) : (
                                  sentence.content
                                )}
                              </Box>
                            ))}
                          </Typography>
                        </Box>
                      </Box>
                    ));
                  })()}
                </Box>
              </Paper>
            )}
          </Container>
        </Box>
        
        {/* Media player section - fixed at the bottom */}
        {mediaFile && (
          <Box sx={{ 
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
          }}>
            <Container maxWidth="lg">
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                py: 1.5,
                px: 2,
              }}>
                
                <Box sx={{ 
                  flexGrow: 1, 
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <audio
                    ref={mediaRef}
                    controls
                    onTimeUpdate={handleTimeUpdate}
                    style={{ 
                      width: '100%',
                      height: '40px',
                      outline: 'none',
                    }}
                  >
                    <source src={mediaFile} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </Box>
              </Box>
            </Container>
          </Box>
        )}
    </ThemeProvider>
  );
};

export default ScriptPlayer;
               