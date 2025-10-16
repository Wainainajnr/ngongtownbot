// Simple analytics tracking
export type AnalyticsEvent = 
  | 'chat_message_sent'
  | 'quick_option_clicked'
  | 'registration_started'
  | 'registration_completed'
  | 'language_changed'
  | 'course_info_viewed'
  | 'error_occurred'
  | 'connection_restored'
  | 'connection_lost'
  | 'page_view';

interface AnalyticsParams {
  event: AnalyticsEvent;
  label?: string;
  value?: number;
  [key: string]: any;
}

export class Analytics {
  private static instance: Analytics;

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  track({ event, label, value, ...params }: AnalyticsParams): void {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, {
        event_label: label,
        value: value,
        ...params
      });
    }

    // Simple console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', { event, label, value, ...params });
    }

    // You can add other analytics providers here (Mixpanel, Amplitude, etc.)
    this.trackToAPI({ event, label, value, ...params });
  }

  private async trackToAPI(params: AnalyticsParams): Promise<void> {
    try {
      // Send to your analytics endpoint
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          timestamp: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        }),
      });
    } catch (error) {
      console.warn('Failed to send analytics:', error);
    }
  }

  // Page view tracking
  trackPageView(page: string): void {
    this.track({
      event: 'page_view',
      label: page,
    });
  }
}

export const analytics = Analytics.getInstance();