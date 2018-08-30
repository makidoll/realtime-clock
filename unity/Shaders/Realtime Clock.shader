// Made by Maki and Desunyan~
// Thank for downloading! ^^'

Shader "Maki/Realtime Clock" {
	Properties {
		_Texture("Texture", 2D) = "black" {}
		_MainTex("Sync Texture", 2D) = "white" {}
		[HDR]_Color("Color", Color) = (1,1,1,1)
		[HDR]_BgColor("Background Color", Color) = (0,0,0,1)
		[Toggle(TICKTACK)] _ApplyTickTack("Discrete Seconds", Int) = 0
	}
	SubShader {
		Tags {
			"IgnoreProjector" = "True"
			"Queue" = "Transparent"
			"RenderType" = "Transparent"
		}
		LOD 200

		Blend SrcAlpha OneMinusSrcAlpha
		Cull Back
		ZWrite On

		Pass {
			CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag
			#pragma multi_compile_fog
			#pragma multi_compile APPLY_GAMMA_OFF
			#pragma multi_compile TICKTACK_OFF TICKTACK

			#include "UnityCG.cginc"

			uniform sampler2D _Texture;
			uniform float4 _Texture_ST;

			uniform sampler2D _MainTex;
			uniform float4 _MainTex_ST;

			uniform float4 _Color;
			uniform float4 _BgColor;

			struct appdata {
				float4 vertex: POSITION;
				float2 uv: TEXCOORD0;
				float4 color: COLOR;
				UNITY_VERTEX_INPUT_INSTANCE_ID
			};

			struct v2f {
				float4 vertex: SV_POSITION;
				float2 uv: TEXCOORD0;
				float4 color: COLOR;
				UNITY_FOG_COORDS(1)
				UNITY_VERTEX_OUTPUT_STEREO
			};

			float2 rotate(float2 p, float r) {
				r = r * 6.28318;
				return float2(
					p.x*cos(r) - p.y*sin(r),
					p.y*cos(r) + p.x*sin(r)
				);
			}

			int getHour(float3 textureFloats) {
				return round(((textureFloats.x + textureFloats.y + textureFloats.z) / 3) * 24);
			}

			int getMinSec(float3 textureFloats) {
				return round(((textureFloats.x + textureFloats.y + textureFloats.z) / 3) * 60);
			}

			v2f vert(appdata v) {
				float3 first = tex2Dlod(_MainTex,float4(0.25,0.75,0,0)).rgb;
				float3 second = tex2Dlod(_MainTex,float4(0.75,0.75,0,0)).rgb;
				float3 third = tex2Dlod(_MainTex,float4(0.25,0.25,0,0)).rgb;

				float3 offsetTime = float3(
					getHour(float3(first.r,second.g,third.b)),
					getMinSec(float3(first.g,second.b,third.r)),
					getMinSec(float3(first.b,second.r,third.g))
				);

				float offset = (
					(offsetTime.r * 60 * 60) +
					(offsetTime.g * 60) +
					(offsetTime.b)
				);

				float time = 0;
				if (tex2Dlod(_MainTex,float4(0.75,0.25,0,0)).r < 0.5) {
					time = offset + _Time.y;
				}

#if TICKTACK
				float s = round(time) / 60;
#else
				float s = time / 60;
#endif
				float m = time / 60 / 60;
				float h = time / 60 / 60 / 12;

				int handleIndex = -1; // s,m,h

				if (v.color.r == 1) {
					if (v.color.g == 0) {
						handleIndex = 0;
					}
				}
				else {
					if (v.color.g == 1) {
						handleIndex = 1;
					}
					else {
						if (v.color.b == 1) {
							handleIndex = 2;
						}
					}
				}

				if (handleIndex == 0) { // seconds
					v.vertex.xy = rotate(v.vertex.xy, s);
				}
				else if (handleIndex == 1) { // minute
					v.vertex.xy = rotate(v.vertex.xy, m);
				}
				else if (handleIndex == 2) { // hour
					v.vertex.xy = rotate(v.vertex.xy, h);
				}

				v2f o;
				UNITY_SETUP_INSTANCE_ID(v);
				UNITY_INITIALIZE_OUTPUT(v2f, o)
				UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
				o.vertex = UnityObjectToClipPos(v.vertex);
				o.uv = v.uv;
				o.color = v.color;
				UNITY_TRANSFER_FOG(o,o.vertex);
				return o;
			}

			float4 frag(v2f i) : COLOR {
				float4 color = _Color;

				if (i.color.r == 0) {
					if (i.color.g == 0) {
						if (i.color.b == 0) {
							float4 _Texture_var = tex2D(_Texture,TRANSFORM_TEX(i.uv, _Texture));
							clip(_Texture_var.a - 0.5);
						}
					}
				}

				if (i.color.b > 0.45) {
				if (i.color.b < 0.55) {
					color = _BgColor;
				}
				}

				UNITY_APPLY_FOG(i.fogCoord, color);
				return color;
			}
			ENDCG
		}
	}
}
