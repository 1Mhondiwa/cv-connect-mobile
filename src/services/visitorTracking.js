import api from './api';

class VisitorTrackingService {
  // Track a visit from mobile app
  static async trackVisit(pageVisited, userId = null) {
    try {
      const payload = {
        device_type: 'mobile',
        page_visited: pageVisited,
        user_id: userId ? parseInt(userId) : null,
      };

      console.log('📱 Mobile tracking visit:', payload);

      await api.post('/visitor/track', payload, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      
      console.log('✅ Mobile visit tracked successfully');
    } catch (error) {
      console.error('❌ Mobile visitor tracking failed:', error);
    }
  }

  // Track login visit
  static async trackLogin(userId) {
    await this.trackVisit('/mobile/login', userId);
  }

  // Track dashboard visit
  static async trackDashboard(userId) {
    await this.trackVisit('/mobile/dashboard', userId);
  }

  // Track profile visit
  static async trackProfile(userId) {
    await this.trackVisit('/mobile/profile', userId);
  }

  // Track search visit
  static async trackSearch(userId) {
    await this.trackVisit('/mobile/search', userId);
  }
}

export default VisitorTrackingService;
