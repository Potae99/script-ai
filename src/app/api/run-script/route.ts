import { NextRequest, NextResponse } from 'next/server';
import type { FormData, IntentPayload, ApiResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const formData: FormData = await request.json();
    
    // Create the payload for the API
    const payload: IntentPayload = {
      pageid: formData.pageid,
      intentname: formData.intentname,
      q_type: "text",
      a_type: "json",
      q_val: formData.q_val,
      a_val: formData.a_val,
      context_in: "",
      context_out: "",
      postidlist: "",
      userstatus: "",
      usertags: "",
      isShow: true,
      linenoti_status: false,
      linenoti_text: null,
      starttime: null,
      endtime: null,
      intentstatus: true,
      follow_up_fb_quick_reply: "",
      follow_up_fb_val: null,
      follow_up_ig_quick_reply: null,
      follow_up_ig_val: null,
      follow_up_line_quick_reply: "",
      follow_up_line_val: null,
      follow_up_quick_reply: null,
      follow_up_status: null,
      follow_up_type: "json",
      follow_up_val: "[[]]",
      follow_up_within_seconds: null,
      follow_up_whatsapp_quick_reply: null,
      follow_up_whatsapp_val: null,
      time_setting: null,
      exceptpostidlist: "",
      post_keywords: "",
      onlytime: false,
      quick_reply: "",
      follow_up_intentgroup: {
        assigngroupid: null,
        assignsubgroupid: null,
        priority: null,
        duedate: null,
        day: null,
        hour: null,
        minute: null,
        mood: null,
        wrap_up: null,
        wrap_up_route: null,
        tags: null
      },
      user_tags_delete: "",
      follow_up_usertags: "",
      intentgroup: {
        assigngroupid: null,
        assignsubgroupid: null,
        priority: null,
        duedate: null,
        day: null,
        hour: null,
        minute: null,
        mood: null,
        wrap_up: null,
        wrap_up_route: null,
        tags: null
      }
    };

    // Make the API call to zwiz
    const response = await fetch('https://api-enterprise.zwiz.app/intents', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'accept-language': 'th-TH,th;q=0.9,en;q=0.8',
        'authorization': `BEARER jm_admin01 ${formData.authToken}`,
        'content-type': 'application/json',
        'origin': 'https://demo.enterprise.zwiz.app',
        'referer': 'https://demo.enterprise.zwiz.app/',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    const apiResponse: ApiResponse = {
      success: true,
      data: data
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error('Error calling API:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}