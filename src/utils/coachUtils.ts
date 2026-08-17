import { CoachProfile, User, CantonCode } from '../types';

export const createDefaultCoachProfile = (user?: User): CoachProfile => {
  const userId = user?.id || 'user_coach_' + Date.now();
  const name = user?.name || 'Neuer Coach';
  const avatar = user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';
  const locationName = user?.city || 'Zürich';
  const canton = (user?.canton as CantonCode) || 'ZH';

  return {
    id: 'coach_' + userId,
    userId,
    name,
    avatar,
    locationName,
    canton,
    coordinates: { lat: 47.3769, lng: 8.5417 },
    hourlyRate: 100,
    groupRate: 50,
    fiveSessionDiscount: 0,
    tenSessionDiscount: 0,
    rating: 5.0,
    reviewCount: 0,
    sports: [],
    bio: '',
    achievements: [],
    certificates: [],
    isVerified: user?.isVerified ?? false,
    languages: ['Deutsch'],
    slogan: '',
    isProfileActive: false,
    featured: false
  };
};
