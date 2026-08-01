import * as vscode from "vscode"
import { getChatReadableWidth, getWebviewFontSize } from "../utils"

export function watchFontSizeConfig(
  post: (msg: { type: "fontSizeChanged"; fontSize: number }) => void,
  next?: vscode.Disposable,
) {
  const font = vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("kilo-code.new.fontSize"))
      post({ type: "fontSizeChanged", fontSize: getWebviewFontSize() })
  })
  return next ? vscode.Disposable.from(font, next) : font
}

export function watchChatWidthConfig(
  post: (msg: { type: "chatReadableWidthChanged"; width: number }) => void,
  next?: vscode.Disposable,
) {
  const width = vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("kilo-code.new.chatReadableWidth"))
      post({ type: "chatReadableWidthChanged", width: getChatReadableWidth() })
  })
  return next ? vscode.Disposable.from(width, next) : width
}
