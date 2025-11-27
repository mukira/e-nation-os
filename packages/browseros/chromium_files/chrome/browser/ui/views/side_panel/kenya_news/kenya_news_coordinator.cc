// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/views/side_panel/kenya_news/kenya_news_coordinator.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/side_panel/side_panel_coordinator.h"
#include "chrome/browser/ui/views/side_panel/side_panel_entry.h"
#include "chrome/browser/ui/views/side_panel/side_panel_registry.h"
#include "chrome/browser/ui/webui/side_panel/kenya_news/kenya_news_ui.h"
#include "chrome/common/webui_url_constants.h"
#include "content/public/browser/web_contents.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/views/controls/webview/webview.h"

KenyaNewsCoordinator::KenyaNewsCoordinator(Browser *browser)
    : browser_(browser) {}

KenyaNewsCoordinator::~KenyaNewsCoordinator() = default;

void KenyaNewsCoordinator::CreateAndRegisterEntry() {
  auto *browser_view = BrowserView::GetBrowserViewForBrowser(browser_);
  auto *side_panel_registry =
      browser_view->side_panel_coordinator()->GetWindowRegistry();
  auto entry = std::make_unique<SidePanelEntry>(
      SidePanelEntry::Id::kKenyaNews, u"Kenya News",
      ui::ImageModel::FromVectorIcon(vector_icons::kNewsIcon, ui::kColorIcon,
                                     16),
      base::BindRepeating(&KenyaNewsCoordinator::CreateKenyaNewsWebView,
                          base::Unretained(this)));
  entry->AddObserver(this);
  side_panel_entry_ = std::move(entry);
  side_panel_registry->Register(std::move(side_panel_entry_));
}

std::unique_ptr<views::View> KenyaNewsCoordinator::CreateKenyaNewsWebView() {
  auto web_view = std::make_unique<views::WebView>(browser_->profile());
  // Create WebUI for Kenya News
  content::WebContents *web_contents = web_view->GetWebContents();
  KenyaNewsUI::CreateForWebContents(web_contents);
  // Navigate to the Kenya News WebUI
  web_contents->GetController().LoadURL(
      GURL("chrome://kenya-news"), content::Referrer(),
      ui::PAGE_TRANSITION_AUTO_TOPLEVEL, std::string());
  return web_view;
}

void KenyaNewsCoordinator::OnSidePanelDidClose() {
  // Cleanup when panel closes
}
