import React, { useState } from 'react';
import { storage } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ProfilePictureProps {
  userId: string;
  currentUrl: string;
  onUpdate: (url: string) => void;
  isEditing: boolean;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ userId, currentUrl, onUpdate, isEditing }) => {
  const [imageUrl, setImageUrl] = useState(currentUrl);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const storageRef = ref(storage, `profile_pictures/${userId}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setImageUrl(url);
      onUpdate(url);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <img src={imageUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
      {isEditing && (
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="mt-2"
        />
      )}
    </div>
  );
};

export default ProfilePicture;