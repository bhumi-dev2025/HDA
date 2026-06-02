const fs = require('fs');
let lines = fs.readFileSync('D:\\DEVMODE\\appdark\\componunts\\FloatingChatButton.tsx', 'utf8').split('\n');

// Find return ( line
let returnLine = -1;
for (let i = 460; i < lines.length; i++) {
  if (lines[i].trim() === 'return (') { returnLine = i; break; }
}

// Find end );
let endLine = -1;
for (let i = lines.length - 1; i > returnLine; i--) {
  if (lines[i].trim() === ');' && lines[i+1] && lines[i+1].trim() === '},') { endLine = i; break; }
}

console.log('return( at line:', returnLine+1, '| end ); at line:', endLine+1);

// Extract content between AppBottomSheet tags (the chat content)
// Find AppBottomSheet opening and closing
let sheetStart = -1, sheetEnd = -1;
for (let i = returnLine; i < endLine; i++) {
  if (lines[i].includes('<AppBottomSheet')) { sheetStart = i; break; }
}
// Find innermost content — skip AppBottomSheet props lines
let contentStart = -1;
for (let i = sheetStart; i < endLine; i++) {
  if (lines[i].trim() === '>') { contentStart = i + 1; break; }
}
// Find </AppBottomSheet>
let contentEnd = -1;
for (let i = endLine; i > contentStart; i--) {
  if (lines[i].trim() === '</AppBottomSheet>') { contentEnd = i; break; }
}

console.log('content:', contentStart+1, 'to', contentEnd);

// Get chat content (without extra </View> wrapper we added)
let chatLines = lines.slice(contentStart, contentEnd);
// Remove the extra <View flex:1> we added at start and </View> at end
if (chatLines[0].includes('<View style={{ flex: 1')) chatLines = chatLines.slice(1);
// Remove last </View> that was our wrapper
for (let i = chatLines.length-1; i >= 0; i--) {
  if (chatLines[i].trim() === '</View>') { chatLines.splice(i, 1); break; }
}

const modalBg = "const modalBg = require('../assets/2.0/model/bg.png');";

const newReturn = [
  `    return (`,
  `      <>`,
  `        <Modal`,
  `          visible={isOpen}`,
  `          transparent`,
  `          animationType="slide"`,
  `          onRequestClose={() => setIsOpen(false)}`,
  `        >`,
  `          <View style={{ flex: 1, justifyContent: "flex-end" }}>`,
  `            <TouchableOpacity`,
  `              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: D.backdrop }}`,
  `              activeOpacity={1}`,
  `              onPress={() => setIsOpen(false)}`,
  `            />`,
  `            <KeyboardAvoidingView`,
  `              behavior={Platform.OS === "ios" ? "padding" : undefined}`,
  `              keyboardVerticalOffset={0}`,
  `            >`,
  `              <ImageBackground`,
  `                source={modalBg}`,
  `                resizeMode="cover"`,
  `                style={{`,
  `                  borderTopLeftRadius: 28,`,
  `                  borderTopRightRadius: 28,`,
  `                  overflow: "hidden",`,
  `                  height: Platform.OS === "ios" ? (keyboardHeight > 0 ? 720 - keyboardHeight : 580) : (keyboardHeight > 0 ? 420 : 580),`,
  `                  marginBottom: Platform.OS === "android" ? keyboardHeight : 0,`,
  `                }}`,
  `                imageStyle={{ borderTopLeftRadius: 28, borderTopRightRadius: 28 }}`,
  `              >`,
  `                {/* Drag Handle */}`,
  `                <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 4 }}>`,
  `                  <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: D.handle }} />`,
  `                </View>`,
  ...chatLines,
  `              </ImageBackground>`,
  `            </KeyboardAvoidingView>`,
  `          </View>`,
  `        </Modal>`,
  `      </>`,
  `    );`,
];

// Rebuild file
const before = lines.slice(0, returnLine);
const after = lines.slice(endLine + 1);

const result = [...before, ...newReturn, ...after].join('\n');
fs.writeFileSync('D:\\DEVMODE\\appdark\\componunts\\FloatingChatButton.tsx', result, 'utf8');
console.log('Done! Total lines:', result.split('\n').length);
