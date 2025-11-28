import os

path = '/Users/Mukira/chromium/src/services/webnn/coreml/utils_coreml.mm'
with open(path, 'r') as f:
    content = f.read()

print(f"Read {len(content)} bytes from {path}")

# Fix missing case
if 'case MLMultiArrayDataTypeInt8:' not in content:
    print("Adding MLMultiArrayDataTypeInt8 case...")
    content = content.replace(
        'case MLMultiArrayDataTypeFloat16:\n      return 2;',
        'case MLMultiArrayDataTypeFloat16:\n      return 2;\n    case MLMultiArrayDataTypeInt8:\n      return 1;'
    )
else:
    print("MLMultiArrayDataTypeInt8 case already present.")

# Fix missing return
# We look for the end of the switch statement and the end of the function
# The function ends with "}" and the switch ends with "}"
# In the file content:
#   }
# }
if 'return 0;\n}' not in content:
    print("Adding return 0; to end of function...")
    # Be careful with replacement to match exact indentation if possible, or just loose match
    # The file has:
    #   }
    # }
    # We want:
    #   }
    #   return 0;
    # }
    content = content.replace(
        '    case MLMultiArrayDataTypeFloat16:\n      return 2;\n    case MLMultiArrayDataTypeInt8:\n      return 1;\n  }\n}',
        '    case MLMultiArrayDataTypeFloat16:\n      return 2;\n    case MLMultiArrayDataTypeInt8:\n      return 1;\n  }\n  return 0;\n}'
    )

with open(path, 'w') as f:
    f.write(content)

print("File patched successfully.")
