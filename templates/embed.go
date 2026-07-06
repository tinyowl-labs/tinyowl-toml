package templates

import "embed"

// FS embeds all template directories for use by the CLI, server, and frontend.
//
//go:embed mola-scr/*
var FS embed.FS
