import { useId, useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import ContentImage from './ContentImage.jsx';
import { imageSlots } from '../image-assets.js';

export async function resizeProfilePhoto(file) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Choose an image smaller than 10 MB.');

  const source = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    const scale = Math.min(1, 640 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This image could not be processed on this device.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(source);
  }
}

export default function ProfilePhoto({ photo, name, onChange, large = false, disabled = false }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const updatePhoto = async (nextPhoto) => {
    if (disabled || busy) return;
    setBusy(true);
    setError('');
    try {
      await onChange(nextPhoto);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The profile photo could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const choosePhoto = async (event) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file || disabled || busy) return;

    setBusy(true);
    setError('');
    try {
      await onChange(await resizeProfilePhoto(file));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The selected image could not be loaded.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`profile-photo-control ${large ? 'large' : ''} ${disabled ? 'disabled' : ''}`}>
      <div className="profile-photo-frame">
        <span className="profile-photo-circle">
          <ContentImage
            src={photo || imageSlots.profile.fallback}
            alt={name ? `${name} profile photo` : 'Profile photo'}
            fallbackSrc={imageSlots.profile.fallback}
            loading="eager"
          />
        </span>
        <button type="button" className="profile-photo-camera" aria-label={photo ? 'Change profile photo' : 'Add profile photo'} disabled={disabled || busy} onClick={() => inputRef.current?.click()}>
          <Camera size={large ? 19 : 16} aria-hidden="true" />
        </button>
        <input
          ref={inputRef}
          id={inputId}
          className="profile-photo-input"
          type="file"
          accept="image/*"
          aria-label="Choose profile photo"
          disabled={disabled || busy}
          onChange={choosePhoto}
        />
      </div>
      {!disabled && (
        <div className="profile-photo-actions">
          <button type="button" className="profile-photo-change" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? 'Preparing photo…' : photo ? 'Change photo' : 'Add a photo'}
          </button>
          {photo && (
            <button type="button" className="profile-photo-remove" disabled={busy} onClick={() => updatePhoto('')}>
              <Trash2 size={13} /> Remove
            </button>
          )}
        </div>
      )}
      {error && <p className="profile-photo-error" role="alert">{error}</p>}
    </div>
  );
}