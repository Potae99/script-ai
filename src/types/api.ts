export interface IntentGroup {
  assigngroupid: number | null;
  assignsubgroupid: number | null;
  priority: number | null;
  duedate: string | null;
  day: number | null;
  hour: number | null;
  minute: number | null;
  mood: string | null;
  wrap_up: string | null;
  wrap_up_route: string | null;
  tags: string | null;
}

export interface IntentPayload {
  pageid: string;
  intentname: string;
  q_type: string;
  a_type: string;
  q_val: string;
  a_val: string;
  context_in: string;
  context_out: string;
  postidlist: string;
  userstatus: string;
  usertags: string;
  isShow: boolean;
  linenoti_status: boolean;
  linenoti_text: string | null;
  starttime: string | null;
  endtime: string | null;
  intentstatus: boolean;
  follow_up_fb_quick_reply: string;
  follow_up_fb_val: string | null;
  follow_up_ig_quick_reply: string | null;
  follow_up_ig_val: string | null;
  follow_up_line_quick_reply: string;
  follow_up_line_val: string | null;
  follow_up_quick_reply: string | null;
  follow_up_status: string | null;
  follow_up_type: string;
  follow_up_val: string;
  follow_up_within_seconds: number | null;
  follow_up_whatsapp_quick_reply: string | null;
  follow_up_whatsapp_val: string | null;
  time_setting: string | null;
  exceptpostidlist: string;
  post_keywords: string;
  onlytime: boolean;
  quick_reply: string;
  follow_up_intentgroup: IntentGroup;
  user_tags_delete: string;
  follow_up_usertags: string;
  intentgroup: IntentGroup;
}

export interface FormData {
  pageid: string;
  intentname: string;
  q_val: string;
  a_val: string;
  authToken: string;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}