// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef CHROME_BROWSER_UI_VIEWS_SIDE_PANEL_KENYA_NEWS_KENYA_NEWS_COORDINATOR_H_
#define CHROME_BROWSER_UI_VIEWS_SIDE_PANEL_KENYA_NEWS_KENYA_NEWS_COORDINATOR_H_

#include "base/memory/raw_ptr.h"
#include "chrome/browser/ui/views/side_panel/side_panel_entry.h"
#include "chrome/browser/ui/views/side_panel/side_panel_view_state_observer.h"

class Browser;

namespace views {
class View;
}

// KenyaNewsCoordinator handles the creation and registration of the Kenya News
// side panel.
class KenyaNewsCoordinator : public SidePanelViewStateObserver {
public:
  explicit KenyaNewsCoordinator(Browser *browser);
  KenyaNewsCoordinator(const KenyaNewsCoordinator &) = delete;
  KenyaNewsCoordinator &operator=(const KenyaNewsCoordinator &) = delete;
  ~KenyaNewsCoordinator() override;

  // Creates and registers the Kenya News side panel entry
  void CreateAndRegisterEntry();

  // SidePanelViewStateObserver:
  void OnSidePanelDidClose() override;

private:
  std::unique_ptr<views::View> CreateKenyaNewsWebView();

  raw_ptr<Browser> browser_;
  std::unique_ptr<SidePanelEntry> side_panel_entry_;
};

#endif // CHROME_BROWSER_UI_VIEWS_SIDE_PANEL_KENYA_NEWS_KENYA_NEWS_COORDINATOR_H_
