import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GlobalStyle,
  AppContainer,
  HeaderContainer,
  ContentContainer,
  HeaderContent,
  LogoContainer,
  Logo,
  AppTitle,
  AppSubtitle,
  ScriptContainer,
  ScriptPaper,
  ScriptHeader,
  ScriptHeaderTitle,
  ScriptHeaderFilename,
  ScriptHeaderInfo,
  ChangeFilesButton,
  ScriptContent,
  SpeakerGroup,
  SpeakerInfo,
  SpeakerLabel,
  SpeakerContent,
  SpeakerText,
  SentenceContainer,
  Word,
  PlayerContainer,
  PlayerContent,
  AudioPlayer,
  ModalBackdrop,
  ModalContent,
  ModalTitle,
  UploadSection,
  UploadLabel,
  UploadRow,
  UploadButton,
  FileName,
  ModalActions,
  Button,
  CancelButton,
  SubmitButton,
  ErrorMessage,
  ErrorAction,
  LoadingMessage
} from './.styled';

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
  const [isScrolled, setIsScrolled] = useState(false);
  
  const mediaRef = useRef(null);
  const listItemRefs = useRef([]);
  const scriptContentRef = useRef(null);
  
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
        const response = await fetch('/ScriptBuddy/scripts/whole_scripts.json');
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
        const audioPath = '/ScriptBuddy/audio/whole_scripts.mp3';
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
  
  useEffect(() => {
    const handleScroll = (e) => {
      const scrollTop = e.target.scrollTop;
      // Use requestAnimationFrame for smoother animation
      requestAnimationFrame(() => {
        setIsScrolled(scrollTop > 5);
      });
    };

    const scriptContent = scriptContentRef.current;
    if (scriptContent) {
      scriptContent.addEventListener('scroll', handleScroll, { passive: true });
      return () => scriptContent.removeEventListener('scroll', handleScroll);
    }
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
  
  // 解析 JSON 腳本
  const parseJsonTranscript = (jsonData) => {
    // 檢查是否有直接的單詞陣列
    if (Array.isArray(jsonData)) {
      const words = jsonData;
      
      // 將單詞分組為句子
      const sentences = [];
      let currentSentence = null;
      let sentenceIndex = 1;
      
      words.forEach((word, index) => {
        // 跳過空格類型的條目
        if (word.type === 'spacing') {
          if (currentSentence) {
            currentSentence.words.push(word);
            currentSentence.end = word.end;
          }
          return;
        }
        
        // 檢查是否是新的說話者或第一個單詞
        const speakerId = word.speaker_id || null;
        const speakerName = word.speaker_name || null;
        
        // 在以下情況下開始一個新句子：
        // 1. 我們還沒有當前句子
        // 2. 說話者改變了
        // 3. 單詞以句子結束標點符號結尾
        // 4. 前一個單詞以句子結束標點符號結尾
        const isPunctuation = word.text && word.text.match(/[.!?]$/);
        const isPreviousPunctuation = index > 0 && 
          words[index-1].text && 
          words[index-1].text.match(/[.!?]$/);
        const isSpeakerChange = currentSentence && 
          currentSentence.speaker_id !== speakerId;
        
        if (!currentSentence || isSpeakerChange || isPunctuation || isPreviousPunctuation) {
          // 如果我們有當前句子，將其添加到句子陣列中
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
          
          // 開始一個新句子
          currentSentence = {
            words: [word],
            start: word.start,
            end: word.end,
            speaker_id: speakerId,
            speaker_name: speakerName
          };
        } else {
          // 添加到當前句子
          currentSentence.words.push(word);
          currentSentence.end = word.end;
        }
      });
      
      // 添加最後一個句子（如果有的話）
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
    // 檢查 JSON 對象中是否有 words 陣列
    else if (jsonData && jsonData.words && Array.isArray(jsonData.words)) {
      // 類似的處理邏輯，但使用 jsonData.words
      // ... 省略相似的代碼 ...
      
      // 這裡應該實現與上面相同的邏輯，但使用 jsonData.words
      // 為了簡潔，我省略了重複的代碼
      
      return parseJsonTranscript(jsonData.words); // 重用上面的邏輯
    } else {
      throw new Error("Invalid JSON format: missing words array");
    }
  };
  
  // 解析傳統腳本格式
  const parseScript = (content) => {
    // 簡單的解析邏輯
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
        i++; // 跳過內容行
      }
    }
    
    return parsedData;
  };
  
  // 解析時間字符串（例如 "00:01:23.456"）為秒
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
  
  // 判斷單詞是否正在被朗讀
  const isWordActive = (word, currentTime) => {
    return currentTime >= word.start && currentTime <= word.end;
  };
  
  // 處理單詞點擊
  const handleWordClick = (startTime, event) => {
    // 防止點擊事件冒泡到句子
    event.stopPropagation();
    
    if (mediaRef.current) {
      mediaRef.current.currentTime = startTime;
      mediaRef.current.play();
    }
  };
  
  // 獲取說話者顏色
  const getSpeakerColor = (speakerId) => {
    const colors = {
      'Narrator': '#ff6b6b',
      '0': '#ff6b6b',
      '1': '#4ecdc4',
      '2': '#ffbe76',
      '3': '#a29bfe',
      '4': '#55efc4',
      '5': '#ff7675',
      'Anger': '#e74c3c',
      'Sadness': '#3498db',
      'Joy': '#f1c40f',
    };
    
    return colors[speakerId] || colors[speakerId.toString()] || '#ff6b6b';
  };
  
  // 處理腳本數據，將連續的相同說話者的句子組合在一起
  const processScriptData = () => {
    const processedData = [];
    let currentSpeaker = null;
    let currentGroup = null;
    
    scriptData.forEach((item) => {
      const speakerId = `${item.speaker || ''}:${item.speaker_name || ''}`;
      
      if (!currentSpeaker || currentSpeaker !== speakerId) {
        // 開始一個新組
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
        // 添加到當前組
        currentGroup.sentences.push(item);
      }
    });
    
    // 添加最後一個組（如果有的話）
    if (currentGroup) {
      processedData.push(currentGroup);
    }
    
    return processedData;
  };
  
  return (
    <>
      <GlobalStyle />
      <AppContainer $isScrolled={isScrolled}>
        <HeaderContainer $isScrolled={isScrolled}>
          <ContentContainer>
            <HeaderContent>
              <LogoContainer $isScrolled={isScrolled}>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  <Logo src="/ScriptBuddy/images/logo.png" alt="Script Player Logo" $isScrolled={isScrolled} />
                  <AppTitle $isScrolled={isScrolled}>ScriptBuddy</AppTitle>
                </Link>
              </LogoContainer>
              <AppSubtitle $isScrolled={isScrolled}>Practice makes perfect~</AppSubtitle>
            </HeaderContent>
          </ContentContainer>
        </HeaderContainer>
        
        <ContentContainer>
          {/* 載入狀態 */}
          {isLoading && (
            <LoadingMessage>Loading script and audio files...</LoadingMessage>
          )}
          
          {/* 錯誤訊息 */}
          {error && (
            <ErrorMessage>
              {error}
              <ErrorAction onClick={handleOpenUploadModal}>
                Upload Files Manually
              </ErrorAction>
            </ErrorMessage>
          )}
          
          {/* 上傳模態對話框 */}
          <ModalBackdrop $isOpen={uploadModalOpen} onClick={handleCloseUploadModal}>
            <ModalContent $isOpen={uploadModalOpen} onClick={e => e.stopPropagation()}>
              <ModalTitle>Upload Files</ModalTitle>
              
              <UploadSection>
                <UploadLabel>Media File (MP3, WAV)</UploadLabel>
                <UploadRow>
                  <UploadButton>
                    Upload Media
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleMediaUpload}
                    />
                  </UploadButton>
                  <FileName>{mediaFileName || "No file selected"}</FileName>
                </UploadRow>
              </UploadSection>
              
              <UploadSection>
                <UploadLabel>Script File (JSON)</UploadLabel>
                <UploadRow>
                  <UploadButton>
                    Upload Script
                    <input
                      type="file"
                      accept=".json,.txt,.srt,.vtt"
                      onChange={handleScriptUpload}
                    />
                  </UploadButton>
                  <FileName>{scriptFileName || "No file selected"}</FileName>
                </UploadRow>
              </UploadSection>
              
              <ModalActions>
                <CancelButton onClick={handleCloseUploadModal}>
                  Cancel
                </CancelButton>
                <SubmitButton 
                  onClick={handleCloseUploadModal}
                  disabled={!mediaFile || scriptData.length === 0}
                >
                  Done
                </SubmitButton>
              </ModalActions>
            </ModalContent>
          </ModalBackdrop>
          
          {/* 腳本數據部分 */}
          {scriptData.length > 0 && (
            <ScriptContainer>
              <ScriptPaper>
               <ScriptHeader>
                  <ScriptHeaderInfo>
                    <ScriptHeaderTitle>Script</ScriptHeaderTitle>
                    <ScriptHeaderFilename>{scriptFileName}</ScriptHeaderFilename>
                  </ScriptHeaderInfo>
                  <ChangeFilesButton onClick={handleOpenUploadModal}>
                    Change Files
                  </ChangeFilesButton>
                </ScriptHeader>
                
                <ScriptContent ref={scriptContentRef}>
                  {processScriptData().map((group, groupIndex) => (
                    <SpeakerGroup key={groupIndex}>
                      <SpeakerInfo>
                        <SpeakerLabel color={getSpeakerColor(group.speaker || groupIndex)}>
                          {group.speaker || group.speaker === 0 ? group.speaker : groupIndex}
                        </SpeakerLabel>
                      </SpeakerInfo>
                      
                      <SpeakerContent>
                        <SpeakerText>
                          {group.sentences.map((sentence, sentenceIndex) => (
                            <SentenceContainer 
                              key={sentenceIndex}
                              onClick={() => handleTextClick(sentence.start)}
                              ref={el => {
                                if (sentence.index === activeIndex + 1) {
                                  listItemRefs.current[activeIndex] = el;
                                }
                              }}
                            >
                              {/* 如果有單詞級別的數據，則顯示單詞 */}
                              {sentence.words ? (
                                sentence.words.map((word, wordIndex) => {
                                  // 檢查是否需要在單詞後添加空格
                                  const needsSpace = word.type !== 'spacing' && 
                                    wordIndex < sentence.words.length - 1 && 
                                    sentence.words[wordIndex + 1].type !== 'spacing';
                                  
                                  // 跳過空格類型的單詞
                                  if (word.type === 'spacing') {
                                    return null;
                                  }
                                  
                                  return (
                                    <React.Fragment key={wordIndex}>
                                      <Word
                                        $isActive={isWordActive(word, currentTime)}
                                        onClick={(e) => handleWordClick(word.start, e)}
                                      >
                                        {word.text}
                                      </Word>
                                      {needsSpace && ' '}
                                    </React.Fragment>
                                  );
                                })
                              ) : (
                                // 如果沒有單詞級別的數據，則顯示整個內容
                                sentence.content
                              )}
                            </SentenceContainer>
                          ))}
                        </SpeakerText>
                      </SpeakerContent>
                    </SpeakerGroup>
                  ))}
                </ScriptContent>
              </ScriptPaper>
            </ScriptContainer>
          )}
        </ContentContainer>
        {/* 音頻播放器 */}
        {mediaFile && (
          <PlayerContainer>
            <PlayerContent>
              <AudioPlayer
                ref={mediaRef}
                controls
                onTimeUpdate={handleTimeUpdate}
              >
                <source src={mediaFile} type="audio/mpeg" />
                Your browser does not support the audio element.
              </AudioPlayer>
            </PlayerContent>
          </PlayerContainer>
        )}
      </AppContainer>
    </>
  );
};

export default ScriptPlayer;