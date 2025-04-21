import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { supabaseAdmin } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }
    
    const userId = session.user.id as string;
    
    // Fetch user's history items using Supabase admin client to bypass RLS
    const { data: historyItems, error } = await supabaseAdmin
      .from('user_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching history:", error);
      return new NextResponse(JSON.stringify({ error: "Failed to fetch history" }), {
        status: 500,
      });
    }
    
    // Transform the data to match the expected format in the frontend
    const formattedHistoryItems = historyItems.map(item => ({
      id: item.id,
      userId: item.user_id,
      imageUrl: item.image_url,
      wasteType: item.waste_type,
      confidence: item.confidence,
      userDescription: item.user_description,
      recyclingInstructions: item.recycling_instructions,
      createdAt: item.created_at
    }));
    
    return NextResponse.json(formattedHistoryItems);
  } catch (error) {
    console.error("Error fetching history:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch history" }), {
      status: 500,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("History POST request received");
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log("Unauthorized - No session user ID");
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }
    
    const body = await req.json();
    console.log("History request body received:", { 
      wasteType: body.wasteType,
      hasImage: !!body.imageUrl,
      hasInstructions: !!body.recyclingInstructions,
      isUpdate: body.isUpdate 
    });

    const {
      imageUrl,
      wasteType,
      confidence,
      userDescription,
      recyclingInstructions,
      isUpdate,
    } = body;
    
    const userId = session.user.id as string;
    
    // Always create a new history entry regardless of whether recyclingInstructions is null or not
    const { data: historyItem, error } = await supabaseAdmin
      .from('user_history')
      .insert([
        {
          user_id: userId,
          image_url: imageUrl,
          waste_type: wasteType,
          confidence: confidence,
          user_description: userDescription,
          recycling_instructions: recyclingInstructions, // This can be null
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating history entry:", error);
      return new NextResponse(JSON.stringify({ error: "Failed to create history entry" }), {
        status: 500,
      });
    }
    
    console.log("History entry created successfully:", historyItem.id);

    // Transform the response to match the expected format in the frontend
    const formattedHistoryItem = {
      id: historyItem.id,
      userId: historyItem.user_id,
      imageUrl: historyItem.image_url,
      wasteType: historyItem.waste_type,
      confidence: historyItem.confidence,
      userDescription: historyItem.user_description,
      recyclingInstructions: historyItem.recycling_instructions,
      createdAt: historyItem.created_at
    };
    
    return NextResponse.json(formattedHistoryItem);
  } catch (error) {
    console.error("Error creating history entry:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to create history entry" }), {
      status: 500,
    });
  }
}