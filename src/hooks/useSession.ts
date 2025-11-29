import { useState, useEffect } from 'react';

const SESSION_KEY = 'dining_decider_session';

export interface UserSession {
  id: string;
  nickname: string;
  avatar: string;
}

const AVATAR_EMOJIS = ['🍕', '🍔', '🍣', '🌮', '🍜', '🥗', '🍱', '🥘', '🍛', '🍲', '🥙', '🍝'];
const NICKNAMES = ['FoodieExplorer', 'HungryPanda', 'TasteHunter', 'FlavorSeeker', 'BiteAdventurer', 'GourmetGuru', 'NomNomNinja', 'CrunchCaptain'];

export const useSession = () => {
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      setSession(JSON.parse(stored));
    } else {
      const newSession: UserSession = {
        id: crypto.randomUUID(),
        nickname: NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)] + Math.floor(Math.random() * 100),
        avatar: AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)],
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      setSession(newSession);
    }
  }, []);

  const updateNickname = (nickname: string) => {
    if (session) {
      const updated = { ...session, nickname };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      setSession(updated);
    }
  };

  const updateAvatar = (avatar: string) => {
    if (session) {
      const updated = { ...session, avatar };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      setSession(updated);
    }
  };

  return { session, updateNickname, updateAvatar, AVATAR_EMOJIS };
};
