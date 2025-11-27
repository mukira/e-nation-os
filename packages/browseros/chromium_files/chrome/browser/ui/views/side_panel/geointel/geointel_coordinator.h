// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef CHROME_BROWSER_UI_VIEWS_SIDE_PANEL_GEOINTEL_GEOINTEL_COORDINATOR_H_
#define CHROME_BROWSER_UI_VIEWS_SIDE_PANEL_GEOINTEL_GEOINTEL_COORDINATOR_H_

#include "base/memory/raw_ptr.h"
#include "chrome/browser/ui/views/side_panel/side_panel_entry.h"
#include "chrome/browser/ui/views/side_panel/side_panel_view_state_observer.h"

class Browser;

namespace views {
class View;
}

// GeoIntelCoordinator handles the creation and registration of the
// Geospatial Intelligence side panel for E-Nation OS.
// Integrates with Google Earth Engine, Copernicus Sentinel, and Landsat.
class GeoIntelCoordinator : public SidePanelViewStateObserver {
public:
  explicit GeoIntelCoordinator(Browser *browser);
  GeoIntelCoordinator(const GeoIntelCoordinator &) = delete;
  GeoIntelCoordinator &operator=(const GeoIntelCoordinator &) = delete;
  ~GeoIntelCoordinator() override;

  // Creates and registers the GeoIntel side panel entry
  void CreateAndRegisterEntry();

  // Trigger satellite data fetch
  void FetchSatelliteData(const std::string &source);

  // Perform geospatial analysis
  void AnalyzeArea();

  // SidePanelViewStateObserver:
  void OnSidePanelDidClose() override;

private:
  std::unique_ptr<views::View> CreateGeoIntelWebView();

  raw_ptr<Browser> browser_;
  std::unique_ptr<SidePanelEntry> side_panel_entry_;
};

#endif // CHROME_BROWSER_UI_VIEWS_SIDE_PANEL_GEOINTEL_GEOINTEL_COORDINATOR_H_
