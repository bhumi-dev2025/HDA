import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const fetchGoogleFitSteps = async () => {

  try {

    // silently login if already logged
    const currentUser = await GoogleSignin.getCurrentUser();

  if (!currentUser) {
    // જો યુઝર ડેટા ના મળે, તો જ સાઈલેન્ટલી સાઈન-ઈન કરો
    await GoogleSignin.signInSilently();
  }

    // always get fresh access token
    const tokens = await GoogleSignin.getTokens();
    const token = tokens.accessToken;

    if (!token) {
      console.log("Google Fit: No access token found");
      return null;
    }

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

    if (response.status === 401) {
       console.log("Google Fit: Token expired");
       return null;
    }

    const result = await response.json();
    console.log("Google Fit result:", result);
    const point = result?.bucket?.[0]?.dataset?.[0]?.point;

if (!point || point.length === 0) {
  return null;
}

const steps = point[0]?.value?.[0]?.intVal;

return steps ?? null;

  } catch (error) {

    console.log("Google Fit error:", error);

    return null;

  }

};
