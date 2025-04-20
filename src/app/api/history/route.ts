import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/db";
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
    
    // Fetch user's history items
    const historyItems = await prisma.userHistory.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(historyItems);
  } catch (error) {
    console.error("Error fetching history:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch history" }), {
      status: 500,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }
    
    const body = await req.json();
    const {
      imageUrl,
      wasteType,
      confidence,
      userDescription,
      recyclingInstructions,
    } = body;
    
    const userId = session.user.id as string;
    
    // Create a new history entry
    const historyItem = await prisma.userHistory.create({
      data: {
        userId,
        imageUrl,
        wasteType,
        confidence,
        userDescription,
        recyclingInstructions,
      },
    });
    
    return NextResponse.json(historyItem);
  } catch (error) {
    console.error("Error creating history entry:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to create history entry" }), {
      status: 500,
    });
  }
}