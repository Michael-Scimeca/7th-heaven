export type UserRole = 'fan' | 'crew' | 'admin';

export interface Profile {
 id: string;
 email: string;
 full_name: string;
 avatar_url: string | null;
 role: UserRole;
 can_stream: boolean;
 date_of_birth: string;
 phone: string | null;
 zip: string | null;
 notification_radius: number;
 notifications_enabled: boolean;
 shows_attended: number;
 points: number;
 tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
 created_at: string;
 updated_at: string;
}

export interface ShowMessage {
 id: string;
 show_id: string;
 user_id: string;
 message: string;
 created_at: string;
 profile?: Pick<Profile, 'full_name' | 'avatar_url' | 'role'>;
}

export interface Show {
 id: string;
 venue_name: string;
 venue_address: string;
 city: string;
 state: string;
 date: string;
 time: string;
 status: 'upcoming' | 'live' | 'ended';
 latitude: number;
 longitude: number;
 attendance_count: number;
 created_at: string;
}

export interface ShowAttendance {
 id: string;
 show_id: string;
 user_id: string;
 status: 'going' | 'there';
 checked_in_at: string | null;
 created_at: string;
}

export type PostType = 'update' | 'setlist' | 'photo' | 'video' | 'fan_moment' | 'announcement';
export type ReactionEmoji = '🔥' | '🎸' | '❤️' | '🤘' | '👏';
export type StreamStatus = 'pending' | 'live' | 'ended';

export interface LiveFeedPost {
 id: string;
 user_id: string;
 show_id: string | null;
 post_type: PostType;
 content: string;
 media_url: string | null;
 media_type: 'image' | 'video' | null;
 is_pinned: boolean;
 likes_count: number;
 created_at: string;
 profile?: Pick<Profile, 'full_name' | 'avatar_url' | 'role'>;
}

export interface FeedReaction {
 id: string;
 post_id: string;
 user_id: string;
 reaction: ReactionEmoji;
 created_at: string;
}

export interface LiveStream {
 id: string;
 user_id: string;
 show_id: string | null;
 title: string;
 stream_url: string | null;
 thumbnail_url: string | null;
 status: StreamStatus;
 viewer_count: number;
 started_at: string | null;
 ended_at: string | null;
 created_at: string;
 profile?: Pick<Profile, 'full_name' | 'avatar_url' | 'role'>;
}
