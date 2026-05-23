import { View, Text } from "react-native";

type Props = {
  role: "user" | "model" | "system" | "error";
  text: string;
};

export default function ChatBubble({ role, text }: Props) {
  const isUser = role === "user";

  // ─── System bubble — Green ────────────────────────────────────────────────
  if (role === "system") {
    const lines = text.split("\n");
    const header = lines[0];
    const taskLines = lines.slice(1);
    return (
      <View style={{ marginVertical: 8, marginHorizontal: 16 }}>
        <View style={{ backgroundColor: 'rgba(48,209,88,0.1)', borderWidth: 1, borderColor: 'rgba(48,209,88,0.25)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 15, marginRight: 8 }}>✅</Text>
            <Text style={{ color: '#30D158', fontSize: 13, fontWeight: '600', flex: 1 }}>{header}</Text>
          </View>
          {taskLines.map((line, i) => (
            <Text key={i} style={{ color: '#30D158', fontSize: 13, marginLeft: 28 }}>{line}</Text>
          ))}
        </View>
      </View>
    );
  }

  // ─── Error bubble — Red ───────────────────────────────────────────────────
  if (role === "error") {
    return (
      <View style={{ marginVertical: 8, marginHorizontal: 16 }}>
        <View style={{ backgroundColor: 'rgba(255,69,58,0.1)', borderWidth: 1, borderColor: 'rgba(255,69,58,0.25)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 15, marginRight: 8 }}>⚠️</Text>
          <Text style={{ color: '#FF453A', fontSize: 13, flex: 1 }}>{text}</Text>
        </View>
      </View>
    );
  }

  // ─── Normal chat bubble ───────────────────────────────────────────────────
  return (
    <View style={{ marginVertical: 4, marginHorizontal: 12, maxWidth: '80%', alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
      <View style={{
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: isUser ? '#0A84FF' : 'rgba(255,255,255,0.1)',
        borderBottomRightRadius: isUser ? 4 : 18,
        borderBottomLeftRadius: isUser ? 18 : 4,
        borderWidth: isUser ? 0 : 1,
        borderColor: 'rgba(255,255,255,0.08)',
      }}>
        <Text style={{ fontSize: 15, color: '#FFFFFF' }}>{text}</Text>
      </View>
      <Text style={{ fontSize: 11, marginTop: 4, color: '#636366', textAlign: isUser ? 'right' : 'left' }}>
        {isUser ? "You" : "Gemini"}
      </Text>
    </View>
  );
}
