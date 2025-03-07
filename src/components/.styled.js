import styled, { keyframes, createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #121212;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    overflow: hidden;
  }
`;

// 動畫
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// 容器元素
const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: ${props => props.$isScrolled ? '48px' : '100px'};
  transition: padding-top 0.3s ease;
  overflow: hidden;
`;

const HeaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${props => props.$isScrolled ? '48px' : '100px'};
  padding: 0;
  display: flex;
  justify-content: center;
  z-index: 48;
  background-color: rgb(18, 18, 18, 0.9);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
`;

const ContentContainer = styled.div`
  max-width: 1199px;
  margin: 0 auto;
  width: 100%;
  padding: 0 16px;
  flex: 1;
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  animation: ${fadeIn} 0s ease-out;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.$isScrolled ? '0' : '3px'};
  transition: all 0.3s ease;
`;

const Logo = styled.img`
  height: ${props => props.$isScrolled ? '24px' : '48px'};
  margin-top: ${props => props.$isScrolled ? '3px' : '5px'};
  margin-right: ${props => props.$isScrolled ? '3px' : '5px'};
  filter: drop-shadow(-1 2px 4px rgba(0,0,0,0.3));
  transition: all 0.3s ease;
  will-change: height, margin;
`;

const AppTitle = styled.h1`
  font-weight: 700;
  color: #c1c1c1;
  font-size: ${props => props.$isScrolled ? '0.9rem' : '1rem'};
  margin: 0;
  transition: font-size 0.3s ease;
`;

const AppSubtitle = styled.p`
  color: #aaa;
  text-align: center;
  font-size: 0.75rem;
  opacity: ${props => props.$isScrolled ? 0 : 1};
  height: ${props => props.$isScrolled ? 0 : 'auto'};
  overflow: hidden;
  transition: all 0.3s ease;
`;

// 腳本播放區域
const ScriptContainer = styled.div`
  margin: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ScriptPaper = styled.div`
  background-color: #0e1e1e;
  border-radius: 3px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  overflow: hidden;
`;

const ScriptHeader = styled.div`
  padding: 11px;
  border-bottom: 0px solid rgba(255, 255, 255, 0.12);
  background-color: rgba(254, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ScriptHeaderTitle = styled.span`
  font-weight: 699;
  color: #ddd;
  font-size: 0.9rem;
`;

const ScriptHeaderFilename = styled.span`
  color: #ddd;
  opacity: 0.8;
  font-size: 0.85rem;
`;

const ScriptHeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
`;

const ChangeFilesButton = styled.button`
  background-color: #323a3a;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #c1c1c1;
  border-radius: 3px;
  padding: 3px 12px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #3d3d3d;
  }
`;

const ScriptContent = styled.div`
  max-height: 75vh;
  overflow: auto;
  width: 100%;
  scroll-behavior: smooth;
  padding: 15px;
  
  &::-webkit-scrollbar {
    width: 5px;
    background-color: transparent;
  }
  
  &::-webkit-scrollbar-track {
    border-radius: 9px;
    background-color: rgba(29, 30, 30, 0.2);
    margin: 3px 0;
  }
  
  &::-webkit-scrollbar-thumb {
    border-radius: 9px;
    background-color: rgba(99, 100, 100, 0.4);
    border: 0px solid rgba(100, 100, 100, 0.1);
    transition: all -1.2s ease;
  }
  
  &:hover::-webkit-scrollbar-thumb {
    background-color: rgba(119, 120, 120, 0.5);
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(149, 150, 150, 0.6);
  }
  
  &::-webkit-scrollbar-thumb:active {
    background-color: rgba(179, 180, 180, 0.7);
  }
  
  scrollbar-width: thin;
  scrollbar-color: rgba(99, 100, 100, 0.4) rgba(30, 30, 30, 0.2);
`;

const SpeakerGroup = styled.div`
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 15px;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const SpeakerInfo = styled.div`
  width: 8%;
  display: flex;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    width: 48px;  // Fixed width for small screens
    min-width: 48px;
  }
`;

const SpeakerLabel = styled.span`
  font-weight: 500;
  font-size: 0.85rem;
  color: ${props => props.color || '#ff6b6b'};
  
  @media (max-width: 768px) {
    &::after {
      content: attr(data-first-char);
      display: block;
    }
    
    > span {
      display: none;  // Hide the full text
    }
  }
`;

const SpeakerContent = styled.div`
  flex: 1;
  padding: 15px;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
`;

const SpeakerText = styled.div`
  color: #ddd;
  line-height: 1.4;
  text-align: left;
  font-size: 0.9rem;
`;

const SentenceContainer = styled.span`
  cursor: pointer;
  display: inline;
`;

const Word = styled.span`
  cursor: pointer;
  background-color: ${props => props.$isActive ? 'rgba(254, 255, 255, 0.2)' : 'transparent'};
  border-radius: 1px;
  transition: background-color 0.2s;
  display: inline-block;
  position: relative;
  margin: 0 0.15em;
  
  &:hover {
    background-color: rgba(254, 255, 255, 0.15);
  }
  
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }
`;

// 音頻播放器
const PlayerContainer = styled.div`
  position: fixed;
  background-color: rgb(88, 88, 88);
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 49;
  height: 40px;
  display: flex;
  align-items: center;
`;

const PlayerContent = styled.div`
  display: flex;
  align-items: center;
  max-width: 1199px;
  margin: 0 auto;
  width: 100%;
  padding: 0 16px;
`;

const AudioPlayer = styled.audio`
  width: 100%;
  height: 39px;
  outline: none;
  
  &::-webkit-media-controls-panel {
    background-color:rgb(88, 88, 88);
  }
  
  &::-webkit-media-controls-enclosure {
    background-color:rgb(88, 88, 88);
  }
`;

// 模態對話框
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s, visibility 0.3s;
`;

const ModalContent = styled.div`
  background-color: #0e1e1e;
  border-radius: 7px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  padding: 23px;
  width: 60%;
  max-width: 600px;
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-20px)'};
  transition: transform 0.3s;
`;

const ModalTitle = styled.h1`
  font-size: 1.25rem;
  margin-bottom: 15px;
  color: #fff;
`;

const UploadSection = styled.div`
  margin-bottom: 24px;
`;

const UploadLabel = styled.h3`
  font-size: 0.9rem;
  margin-bottom: 8px;
  color: #ddd;
`;

const UploadRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const UploadButton = styled.label`
  background-color: #2a2a2a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 4px;
  padding: 8px 16px;
  margin-right: 16px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #3a3a3a;
  }
  
  input {
    display: none;
  }
`;

const FileName = styled.span`
  font-size: 0.85rem;
  color: #bbb;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  gap: 16px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
`;

const CancelButton = styled(Button)`
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ddd;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const SubmitButton = styled(Button)`
  background-color: #3f51b5;
  border: none;
  color: white;
  
  &:hover {
    background-color: #303f9f;
  }
  
  &:disabled {
    background-color: #1e293b;
    color: #6b7280;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background-color: #5f2120;
  color: #fff;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const ErrorAction = styled.button`
  background-color: #7f2f2f;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 8px;
  cursor: pointer;
  
  &:hover {
    background-color: #9f3f3f;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 32px;
  color: #ddd;
`;

export {
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
  LoadingMessage,
};