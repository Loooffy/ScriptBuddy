import os
import json
import base64
from dotenv import load_dotenv
from elevenlabs import ElevenLabs

load_dotenv()

with open('voice_settings.json', 'r') as f:
	voice_settings = json.load(f)

with open('scripts.txt', 'r') as f:
	script_content = f.read()

script_lines = []
current_character = ""
current_line = ""

for line in script_content.split('\n\n'):
	line = line.strip()
	if not line:
		continue
	
	if ': ' in line:
		if current_character and current_line:
			script_lines.append((current_character, current_line))
		
		parts = line.split(': ', 1)
		current_character = parts[0]
		current_line = parts[1]
	else:
		if current_character:
			current_line += " " + line

if current_character and current_line:
	script_lines.append((current_character, current_line))

client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

for i, (character, text) in enumerate(script_lines, 1):
	character_voice = voice_settings.get(character, voice_settings.get("default", {}))
	
	output_filename = f"../media/audio/{i:03d}_{character}.mp3"
	os.makedirs(os.path.dirname(output_filename), exist_ok=True)
	
	print(f"Converting [{i}/{len(script_lines)}]: {character}: {text[:20]}...")
	
	with open(output_filename, 'wb') as f:
		audio_base64 = client.text_to_speech.convert(
			voice_id=character_voice.get("voice_id", voice_settings.get("default", {}).get("voice_id")),
			output_format="mp3_44100_128",
			text=text,
			model_id="eleven_multilingual_v2",
			voice_settings={
				"speed": character_voice.get("speed", 0.7),
				"style": character_voice.get("style", 0.3),
				"stability": character_voice.get("stability", 0.5),
				"similarity_boost": character_voice.get("similarity_boost", 0.7)
			}
		)

		for chunk in audio_base64:
			f.write(chunk)
	
	print(f"Saved to: {output_filename}")