import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import HomeScreen from '@/components/screens/HomeScreen';
import SetupScreen from '@/components/screens/SetupScreen';
import DistributionScreen from '@/components/screens/DistributionScreen';
import RoundScreen from '@/components/screens/RoundScreen';
import VotingScreen from '@/components/screens/VotingScreen';
import ResultScreen from '@/components/screens/ResultScreen';
import GuessScreen from '@/components/screens/GuessScreen';
import ThemesScreen from '@/components/screens/ThemesScreen';
import HowToPlayScreen from '@/components/screens/HowToPlayScreen';
import SettingsScreen from '@/components/screens/SettingsScreen';

export type Screen = 'home' | 'setup' | 'distribution' | 'round' | 'voting' | 'result' | 'guess' | 'themes' | 'howtoplay' | 'settings';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const { state } = useGame();

  // Sync game phase with screen
  const getActiveScreen = (): Screen => {
    if (state.isGameActive) {
      switch (state.gamePhase) {
        case 'distribution':
          return 'distribution';
        case 'round':
          return 'round';
        case 'voting':
          return 'voting';
        case 'result':
          return 'result';
        case 'guess':
          return 'guess';
        default:
          return currentScreen;
      }
    }
    return currentScreen;
  };

  const activeScreen = getActiveScreen();

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen onNavigate={setCurrentScreen} />;
      case 'setup':
        return <SetupScreen onNavigate={setCurrentScreen} />;
      case 'distribution':
        return <DistributionScreen onNavigate={setCurrentScreen} />;
      case 'round':
        return <RoundScreen onNavigate={setCurrentScreen} />;
      case 'voting':
        return <VotingScreen onNavigate={setCurrentScreen} />;
      case 'result':
        return <ResultScreen onNavigate={setCurrentScreen} />;
      case 'guess':
        return <GuessScreen onNavigate={setCurrentScreen} />;
      case 'themes':
        return <ThemesScreen onNavigate={setCurrentScreen} />;
      case 'howtoplay':
        return <HowToPlayScreen onNavigate={setCurrentScreen} />;
      case 'settings':
        return <SettingsScreen onNavigate={setCurrentScreen} />;
      default:
        return <HomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}
    </div>
  );
};

export default Index;
