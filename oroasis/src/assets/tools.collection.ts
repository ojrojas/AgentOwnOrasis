import { ToolFunction } from "../core/types/tool.type";
import { EnumListTool } from "../shared/enums/tool";

export const ListTools: ToolFunction[] = [
    {
        type: Function,
        function: {
            name: EnumListTool.execute_command,
            parameters: {
                type: String,
                properties: {
                    command: { type: "string", description: "The command to execute in the terminal." },
                }
            }
        }
    },
    {
        type: Function,
        function: {
            name: EnumListTool.read_file,
            parameters: {
                type: String,
                properties: {
                    path: { type: "string", description: "The path to the file to read, relative to the workspace root." },
                }
            }
        }
    },
    {
        type: Function,
        function: {
            name: EnumListTool.list_files,
            parameters: {
                type: String,
                properties: {
                    workspace_files: { type: "string", description: "The path to the directory to list files from, relative to the workspace root." },
                }
            }
        },

    },
    {
        type: Function,
        function: {
            name: EnumListTool.write_file,
            parameters: {
                type: Object,
                properties: {
                    path: { type: "string", description: "The path to the file to read, relative to the workspace root." },
                    content: { type: "string", description: "The content to write to the file." }
                }
            }
        }
    },
    {
        type: Function,
        function: {
            name: EnumListTool.replace_in_file,
            parameters: {
                type: Object,
                properties: {
                    path: { type: "string", description: "The path to the file to read, relative to the workspace root." },
                    diff: { type: "string", description: "The diff to apply to the file, in unified diff format." }
                }
            }
        }
    },
    {
        type: Function,
        function: {
            name: EnumListTool.selection_in_file,
            parameters: {
                type: Object,
                properties: {
                    range: {
                        type: "object", properties: {
                            start_position: { type: "number", description: "The start position of the selection." },
                            end_position: { type: "number", description: "The end position of the selection." }
                        },
                        description: "The text to search for in the files."
                    },
                    path: { type: "string", description: "The path to the file to read, relative to the workspace root." },
                }
            }
        }
    },
    {
        type: Function,
        function: {
            name: EnumListTool.search_files,
            parameters: {
                type: Object,
                properties: {
                    query: { type: "string", description: "The text to search for in the files." },
                    path: { type: "string", description: "The path to the file to read, relative to the workspace root." },
                }
            }
        }
    },
    {
        type: Function,
        function: {
            name: EnumListTool.use_mcp_tool,
            parameters: {
                type: String,
                properties: {
                    query: { type: "string", description: "The text to search for in the files." },
                    path: { type: "string", description: "The path to the file to read, relative to the workspace root." },
                }
            }
        }
    }
];