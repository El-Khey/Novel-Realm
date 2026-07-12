package com.novelrealm.dto;

import java.util.List;

/**
 * Une étagère avec le DÉTAIL de ses romans — renvoyée quand on consulte une
 * étagère précise.
 */
public record CategoryDetailResponse(
        Long id,
        String name,
        List<NovelResponse> novels
) {}
