precision highp float;

varying vec2 vUV;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;

uniform sampler2D textureSampler;
uniform vec3 light_position;
uniform vec3 eye_position;

uniform vec3 base_color;
uniform float material_shininess;
uniform float material_kd;
uniform float material_ks;

void main(void) {
    vec4 tx = texture2D(textureSampler, vUV);

    vec3 L = normalize(light_position - vWorldPos); //light direction
    vec3 V = normalize(eye_position - vWorldPos); //view direction
    float LdotN = dot(L, vWorldNormal);
    if (LdotN < 0.0)
        LdotN = 0.0;
    float diffuse = material_kd * LdotN;
    float specular = 0.0;
    
    if (LdotN > 0.0)
    {
        // Phong
        // vec3 R = -normalize(reflect(L, world_normal));//Reflection
        // float RdotV = dot(R, V);
        // if (RdotV < 0.0)
        //     RdotV = 0.0;
        // specular = material_ks * pow(RdotV, material_shininess);
        
        // Blinn-Phong
        vec3 H = normalize(L + V); // halfway vector
        float HdotN = dot(H, vWorldNormal);
        if (HdotN < 0.0)
            HdotN = 0.0;
        specular = material_ks * pow(HdotN, material_shininess);
    }
    
    float light = diffuse + specular;
    light += 0.3;// emissive & ambient
    if (light > 1.0)
        light = 1.0;
    
    //vec4 light_color = vec4(base_color*light, 1.0);
    tx.b = light;
    // if (tx.r < 0.3 && tx.g < 0.3 && tx.b < 0.3)
    //    gl_FragColor = mix(tx, light_color, 0.1);
    // else
    //    gl_FragColor = light_color;
    gl_FragColor = tx;
}