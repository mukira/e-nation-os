import os

file_path = os.path.expanduser("~/chromium/src/services/webnn/coreml/utils_coreml.mm")

with open(file_path, "r") as f:
    content = f.read()

target = """    case MLMultiArrayDataTypeFloat16:
      return 2;
  }
}"""

replacement = """    case MLMultiArrayDataTypeFloat16:
      return 2;
    case MLMultiArrayDataTypeInt8:
      return 1;
  }
  return 0;
}"""

if target in content:
    new_content = content.replace(target, replacement)
    with open(file_path, "w") as f:
        f.write(new_content)
    print("Successfully patched utils_coreml.mm")
else:
    print("Target string not found in utils_coreml.mm")
    # Print surrounding lines to debug
    start_index = content.find("GetDataTypeByteSize")
    if start_index != -1:
        print("Found GetDataTypeByteSize:")
        print(content[start_index:start_index+300])
