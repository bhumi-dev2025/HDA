import { supabase } from "./supabase";

export const fetchGoogleFitSteps = async () => {

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("User not logged in");
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("google_access_token")
    .eq("id", user.id)
    .single();

  if (error || !data?.google_access_token) {
    console.log("No Google Fit token");
    return null;
  }

  const token = data.google_access_token;

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();

  const response = await fetch(
    "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        aggregateBy: [{ dataTypeName: "com.google.step_count.delta" }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: start.getTime(),
        endTimeMillis: end.getTime(),
      }),
    }
  );

  const result = await response.json();
  console.log("Google Fit result:", result);

  const steps =
    result?.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;

  return steps;
};