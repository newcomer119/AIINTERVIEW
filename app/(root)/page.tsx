import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { dummyInterviews } from "@/constants";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser, getInterviewByUserId, getLatestInterview } from "@/lib/actions/auth.actions";
import { Inter } from "next/font/google";
const page = async() => {
  const user = await getCurrentUser();

  const[userInterviews, latestInterviews] = await Promise.all([
    await getInterviewByUserId(user?.id!),
    await getLatestInterview({userId : user?.id!})
  ]);
  const hasPastInterviews = userInterviews && userInterviews.length > 0;
  const hasUpcomingInterviews = latestInterviews && latestInterviews.length > 0;
  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practise and FeedBack</h2>
          <p className="text-lg">
            Practice on real questions and get instant feedback
          </p>
          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>
        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>
      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>
        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard {...interview} key={interview.id}/>
            ))) : <p>You haven't taken any interviews yet</p> 
          }
        </div>
      </section>
      <section>
        <h2>Take an Interview</h2>
        <div className="interviews-section">
        {hasUpcomingInterviews ? (
            latestInterviews?.map((interview) => (
              <InterviewCard {...interview} key={interview.id}/>
            ))) : <p>There are no upcoming interviews yet</p> 
          }
        </div>
      </section>
    </>
  );
};

export default page;
