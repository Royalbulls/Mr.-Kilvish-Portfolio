'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useUser } from './UserContext';

export type VaultItemType = 'song' | 'report' | 'chat' | 'arrangement' | 'script' | 'image' | 'transcript' | 'intelligence' | 'music' | 'feedback' | 'brand_identity' | 'story' | 'lyrics';

export interface VaultItem {
  id: string;
  type: VaultItemType;
  title: string;
  content: any;
  timestamp: string;
  tags: string[];
}

interface VaultContextType {
  items: VaultItem[];
  addItem: (item: Omit<VaultItem, 'id' | 'timestamp'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<VaultItem>) => void;
  isLoaded: boolean;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { firebaseUser, isAuthReady } = useUser();

  useEffect(() => {
    if (!isAuthReady) return;

    if (!firebaseUser) {
      setTimeout(() => {
        setItems([]);
        setIsLoaded(true);
      }, 0);
      return;
    }

    const q = query(
      collection(db, 'users', firebaseUser.uid, 'saved_content'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedItems: VaultItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        try {
          loadedItems.push({
            id: data.id,
            type: data.type as VaultItemType,
            title: data.title,
            content: JSON.parse(data.content),
            timestamp: data.timestamp,
            tags: data.tags || [],
          });
        } catch (e) {
          console.error("Error parsing vault item content:", e);
        }
      });
      setItems(loadedItems);
      setIsLoaded(true);
    }, (error) => {
      console.error("Error fetching vault items:", error);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, [firebaseUser, isAuthReady]);

  const addItem = async (item: Omit<VaultItem, 'id' | 'timestamp'>) => {
    if (!firebaseUser) {
      alert("You must be logged in to save to the Vault.");
      return;
    }
    
    const id = Math.random().toString(36).substring(2, 11);
    const timestamp = new Date().toISOString();
    
    const newItem = {
      id,
      userId: firebaseUser.uid,
      type: item.type,
      title: item.title,
      content: JSON.stringify(item.content),
      tags: item.tags || [],
      timestamp,
    };

    try {
      await setDoc(doc(db, 'users', firebaseUser.uid, 'saved_content', id), newItem);
    } catch (error) {
      console.error("Error adding item to vault:", error);
      alert("Failed to save to Vault.");
    }
  };

  const removeItem = async (id: string) => {
    if (!firebaseUser) return;
    try {
      await deleteDoc(doc(db, 'users', firebaseUser.uid, 'saved_content', id));
    } catch (error) {
      console.error("Error removing item from vault:", error);
    }
  };

  const updateItem = async (id: string, updates: Partial<VaultItem>) => {
    if (!firebaseUser) return;
    try {
      const updateData: any = { ...updates };
      if (updates.content !== undefined) {
        updateData.content = JSON.stringify(updates.content);
      }
      await updateDoc(doc(db, 'users', firebaseUser.uid, 'saved_content', id), updateData);
    } catch (error) {
      console.error("Error updating item in vault:", error);
    }
  };

  return (
    <VaultContext.Provider value={{ items, addItem, removeItem, updateItem, isLoaded }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}
