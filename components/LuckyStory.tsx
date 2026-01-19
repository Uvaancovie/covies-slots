import React, { useState, useEffect } from 'react';
import { generateLuckyStory } from '../services/geminiService';
import { SparkleIcon } from './icons/SparkleIcon';

interface LuckyStoryProps {
  winAmount: number;
  winStreak: number;
}

const LuckyStory: React.FC<LuckyStoryProps> = ({ winAmount, winStreak }) => {
  const [story, setStory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setVisible(false);
    
    const fetchStory = async () => {
      try {
        const generatedStory = await generateLuckyStory(winAmount, winStreak);
        setStory(generatedStory);
      } catch (e) {
        setStory("An amazing win!");
      } finally {
        setLoading(false);
      }
    };
    
    // Delay fetching to allow win animation to start
    const timer = setTimeout(fetchStory, 500);
    
    return () => clearTimeout(timer);
  }, [winAmount, winStreak]);

  useEffect(() => {
    if (!loading) {
      // Make the component visible after loading
      const visibleTimer = setTimeout(() => setVisible(true), 100);
      // And hide it after a while
      const hideTimer = setTimeout(() => setVisible(false), 6000);
      return () => {
        clearTimeout(visibleTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [loading]);

  if (loading) {
    return null;
  }
  
  return (
    <div
      className={`absolute bottom-4 left-1/2 -translate-x-1/2 transform transition-all duration-500 ease-out
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-2xl z-30 flex items-center gap-2 max-w-sm text-center`}
    >
      <SparkleIcon className="w-6 h-6 text-yellow-300 flex-shrink-0" />
      <p className="text-sm font-semibold">{story}</p>
    </div>
  );
};

export default LuckyStory;