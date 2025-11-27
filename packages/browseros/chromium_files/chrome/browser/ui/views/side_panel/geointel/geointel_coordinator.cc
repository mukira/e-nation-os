// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/views/side_panel/geointel/geointel_coordinator.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/side_panel/side_panel_coordinator.h"
#include "chrome/browser/ui/views/side_panel/side_panel_entry.h"
#include "chrome/browser/ui/views/side_panel/side_panel_registry.h"
#include "chrome/browser/ui/webui/side_panel/geointel/geointel_ui.h"
#include "chrome/common/webui_url_constants.h"
#include "content/public/browser/web_contents.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/views/controls/webview/webview.h"

GeoIntelCoordinator::GeoIntelCoordinator(Browser *browser)
    : browser_(browser) {}

GeoIntelCoordinator::~GeoIntelCoordinator() = default;

void GeoIntelCoordinator::CreateAndRegisterEntry() {
  auto *browser_view = BrowserView::GetBrowserViewForBrowser(browser_);
  auto *side_panel_registry =
      browser_view->side_panel_coordinator()->GetWindowRegistry();
  auto entry = std::make_unique<SidePanelEntry>(
      SidePanelEntry::Id::kGeoIntel, u"GeoIntel (Satellite Intelligence)",
      ui::ImageModel::FromVectorIcon(vector_icons::kSatelliteIcon,
                                     ui::kColorIcon, 16),
      base::BindRepeating(&GeoIntelCoordinator::CreateGeoIntelWebView,
                          base::Unretained(this)));
  entry->AddObserver(this);
  side_panel_entry_ = std::move(entry);
  side_panel_registry->Register(std::move(side_panel_entry_));
}

std::unique_ptr<views::View> GeoIntelCoordinator::CreateGeoIntelWebView() {
  auto web_view = std::make_unique<views::WebView>(browser_->profile());
  // Create WebUI for GeoIntel
  content::WebContents *web_contents = web_view->GetWebContents();
  GeoIntelUI::CreateForWebContents(web_contents);
  // Navigate to the GeoIntel WebUI
  web_contents->GetController().LoadURL(
      GURL("chrome://geointel"), content::Referrer(),
      ui::PAGE_TRANSITION_AUTO_TOPLEVEL, std::string());
  return web_view;
}

void GeoIntelCoordinator::FetchSatelliteData(const std::string &source) {
  // In production, this would integrate with:
  // - Google Earth Engine API
  // - Copernicus Sentinel Hub
  // - Landsat collection via USGS
  // - MODIS data via NASA
  LOG(INFO) << "Fetching satellite data from: " << source;
  if (source == "sentinel-2") {
    // Fetch from Copernicus Sentinel Hub
    // https://services.sentinel-hub.com/api/v1/process
  } else if (source == "landsat-8") {
    // Fetch from USGS Earth Explorer
    // https://earthexplorer.usgs.gov/
  } else if (source == "google-earth-engine") {
    // Authenticate and query GEE
    // Requires OAuth2 authentication
  }
}

void GeoIntelCoordinator::AnalyzeArea() {
  // Perform geospatial analysis:
  // - NDVI calculation for vegetation health
  // - Change detection over time
  // - Infrastructure monitoring
  // - Water body analysis
  // - Urban expansion tracking
  LOG(INFO) << "Performing geospatial analysis";
}

void GeoIntelCoordinator::OnSidePanelDidClose() {
  // Cleanup when panel closes
  LOG(INFO) << "GeoIntel panel closed";
}
