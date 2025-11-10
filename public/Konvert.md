# Konvert
Konvert is my attempt at a reflection and ksp preprocessing based json serializer for kotlin, it was not exceptionally fast but it did its job. Quick disclaimer: Do not use this over kotlinx.serialization

## How it works
- Before the build runs, a ksp preprocessor generates metadata classes for each as serializable marked class
- During runtime, the serializer picks up the generated classes to be able to read for example type parameters, that otherwise would be erased at runtime

## Limitations
- Speed: the processing is definitly not the fastest
- Constructuin: objects are constructed by constructor, there must be a constructor present that accepts all args that are serialized