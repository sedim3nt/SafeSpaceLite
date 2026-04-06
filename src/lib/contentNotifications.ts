import { supabase } from './supabase';

type ReportNotificationPayload = {
  type: 'report';
  propertyId: string;
  propertyAddress: string;
  issueType: string;
  severity: string;
  description: string;
  evidenceTier?: string;
  isAnonymous: boolean;
};

type ReviewNotificationPayload = {
  type: 'review';
  propertyId: string;
  propertyAddress: string;
  landlordName: string;
  relationshipType: string;
  comment?: string;
  tags?: string[];
  isAnonymous: boolean;
  ratings: Record<string, number>;
};

export async function sendContentNotification(
  payload: ReportNotificationPayload | ReviewNotificationPayload,
) {
  const { error } = await supabase.functions.invoke('content-notify', {
    body: payload,
  });

  if (error) {
    throw error;
  }
}
