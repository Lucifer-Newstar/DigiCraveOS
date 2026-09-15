# Export Content Metadata

Order CSV responses now include a byte-accurate `Content-Length` header in addition to the existing ETag and attachment filename. This helps gateways and clients validate complete downloads and keeps conditional retry behavior unchanged.

The report export test verifies the header against the generated CSV bytes.
