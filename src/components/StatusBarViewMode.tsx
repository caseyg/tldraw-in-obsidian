import * as React from "react";
import { createRoot } from "react-dom/client";
import { VIEW_TYPE_MARKDOWN, VIEW_TYPE_TLDRAW } from "../utils/constants";
import { useStatusBarState } from "../utils/zustand-stores";
import TldrawIcon from "./TldrawIcon";

const StatusBarViewMode = () => {
	const viewMode = useStatusBarState((state) => state.viewMode);
	const setViewMode = useStatusBarState((state) => state.updateViewMode);

	const a = viewMode === VIEW_TYPE_TLDRAW ? "view-mode-highlight" : "";
	const b = viewMode === VIEW_TYPE_MARKDOWN ? "view-mode-highlight" : "";

	const setTldrawView = () => setViewMode(VIEW_TYPE_TLDRAW);
	const setMarkdownView = () => setViewMode(VIEW_TYPE_MARKDOWN);

	return (
		<div className={`otldraw-status-bar-view-mode-container`}>
			<span>View:</span>
			<div className="tldraw-obs-button-container">
				<button
					type="button"
					className={`otldraw-status-bar-button ${a}`}
					onClick={setTldrawView}
				>
					DR
					{/* <TldrawIcon /> */}
				</button>
				<button
					type="button"
					className={`otldraw-status-bar-button ${b}`}
					onClick={setMarkdownView}
				>
					MD
				</button>
			</div>
		</div>
	);
};

export const createReactStatusBarViewMode = (htmlElement: HTMLElement) => {
	const root = createRoot(htmlElement);

	root.render(
		<React.StrictMode>
			<StatusBarViewMode />
		</React.StrictMode>
	);
};

export default StatusBarViewMode;
