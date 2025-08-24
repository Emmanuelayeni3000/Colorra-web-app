import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiClient } from '@/lib/api';
import useDebounce from '@/hooks/useDebounce';
import { toast } from 'sonner';

interface SharePaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  paletteId: string;
}

interface UserSearchResult {
  id: string;
  name: string;
  avatarUrl?: string;
}

const SharePaletteModal: React.FC<SharePaletteModalProps> = ({ isOpen, onClose, paletteId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (debouncedSearchTerm.trim() === '') {
        setSearchResults([]);
        return;
      }
      try {
  const users = await apiClient.searchUsers(debouncedSearchTerm);
        setSearchResults(users);
      } catch (error) {
        console.error('Error searching users:', error);
        toast.error('Failed to search users.');
      }
    };

    fetchUsers();
  }, [debouncedSearchTerm]);

  const handleShare = async () => {
    if (!selectedUser) {
      toast.error('Please select a user to share with.');
      return;
    }
    setIsSharing(true);
    try {
  await apiClient.sharePalette(paletteId, selectedUser.id);
      toast.success(`Palette shared with ${selectedUser.name}!`);
      onClose();
    } catch (error) {
      console.error('Error sharing palette:', error);
      toast.error('Failed to share palette.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Palette</DialogTitle>
          <DialogDescription>
            Search for a user and share this palette with them.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="user-search"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedUser(null); // Clear selection on new search
            }}
            className="col-span-3"
          />
          {searchResults.length > 0 && !selectedUser && (
            <div className="max-h-48 overflow-y-auto border rounded-md">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedUser(user);
                    setSearchResults([]); // Clear results after selection
                  }}
                >
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
                </div>
              ))}
            </div>
          )}
          {selectedUser && (
            <div className="flex items-center p-2 border rounded-md bg-green-50/20">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.name} />
                <AvatarFallback>{selectedUser.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{selectedUser.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
                className="ml-auto text-red-500 hover:text-gray-200"
              >
                Change
              </Button>
            </div>
          )}
        </div>
        <Button onClick={handleShare} disabled={!selectedUser || isSharing} className="text-white">
          {isSharing ? 'Sharing...' : 'Share Palette'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SharePaletteModal;
