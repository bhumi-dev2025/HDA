import { View, Text } from "react-native";

type Props = {
  role: "user" | "model" | "system" | "error";
  text: string;
};

export default function ChatBubble({ role, text }: Props) {
  const isUser = role === "user";

  // ─── System bubble — Green (todo success) ────────────────────────────────
  if (role === "system") {
    const lines = text.split("\n");
    const header = lines[0];
    const taskLines = lines.slice(1);
    return (
      <View className="my-2 mx-4">
        <View className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
          <View className="flex-row items-center mb-1">
            <Text className="text-green-600 text-base mr-2">✅</Text>
            <Text className="text-green-700 text-sm font-semibold flex-1">{header}</Text>
          </View>
          {taskLines.map((line, i) => (
            <Text key={i} className="text-green-600 text-sm ml-7">{line}</Text>
          ))}
        </View>
      </View>
    );
  }

  // ─── Error bubble — Red (limit exceeded / not found) ─────────────────────
  if (role === "error") {
    return (
      <View className="my-2 mx-4">
        <View className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex-row items-start">
          <Text className="text-red-500 text-base mr-2">⚠️</Text>
          <Text className="text-red-600 text-sm flex-1">{text}</Text>
        </View>
      </View>
    );
  }

  // ─── Normal chat bubble ───────────────────────────────────────────────────
  return (
    <View className={`my-1 mx-3 max-w-[80%] ${isUser ? "self-end" : "self-start"}`}>
      <View
        className={`rounded-2xl px-4 py-3 ${
          isUser ? "bg-blue-500 rounded-br-sm" : "bg-gray-100 rounded-bl-sm"
        }`}
      >
        <Text className={`text-base ${isUser ? "text-white" : "text-gray-900"}`}>
          {text}
        </Text>
      </View>
      <Text className={`text-xs mt-1 text-gray-400 ${isUser ? "text-right" : "text-left"}`}>
        {isUser ? "You" : "Gemini"}
      </Text>
    </View>
  );
}
