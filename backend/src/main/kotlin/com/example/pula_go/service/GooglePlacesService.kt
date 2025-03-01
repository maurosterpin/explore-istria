package com.example.pula_go.service

import com.example.pula_go.model.Attraction
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient

@Service
class GooglePlacesService(
    @Value("\${google.api.key}") private val apiKey: String,
    @Value("\${radius}") private val radius: String
) {
    private val webClient = WebClient.create("https://maps.googleapis.com")

    data class PlacesResponse(
        val results: List<Place>,
        val status: String,
        val next_page_token: String? = null
    )
    data class Place(
        val name: String,
        val place_id: String,
        val geometry: Geometry,
        val photos: List<Photo>? = null
    )
    data class Geometry(val location: Location)
    data class Location(val lat: Double, val lng: Double)
    data class Photo(
        val photo_reference: String,
        val height: Int?,
        val width: Int?,
        val html_attributions: List<String>?
    )

    data class PlaceDetailsResponse(
        val result: PlaceDetails,
        val status: String
    )
    data class PlaceDetails(
        val editorial_summary: EditorialSummary?,
        val photos: List<Photo>?
    )
    data class EditorialSummary(
        val overview: String?
    )

    private val gridPoints = listOf(
        Pair(44.8666, 13.85),
        Pair(44.87, 13.84),
        Pair(44.87, 13.86),
        Pair(44.86, 13.84),
        Pair(44.86, 13.86)
    )

    private fun fetchAttractionDetails(placeId: String): Pair<String?, String?> {
        val detailsUrl = "/maps/api/place/details/json?place_id=$placeId&fields=editorial_summary,photos&key=$apiKey"
        val detailsResponse = webClient.get()
            .uri(detailsUrl)
            .retrieve()
            .bodyToMono(PlaceDetailsResponse::class.java)
            .block()

        if (detailsResponse?.status == "OK") {
            val description = detailsResponse.result.editorial_summary?.overview
            val imageUrl = detailsResponse.result.photos?.firstOrNull()?.let { photo ->
                "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=$apiKey"
            }
            return Pair(description, imageUrl)
        }
        return Pair(null, null)
    }

    fun fetchAllAttractions(): List<Attraction> {
        val attractionsMap = mutableMapOf<String, Attraction>()

        for ((lat, lng) in gridPoints) {
            var url = "/maps/api/place/nearbysearch/json?location=$lat,$lng&radius=$radius&type=tourist_attraction&key=$apiKey"
            do {
                val response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(PlacesResponse::class.java)
                    .block()

                if (response?.status == "OK") {
                    response.results.forEach { place ->
                        if (!attractionsMap.containsKey(place.place_id)) {
                            val (description, imageUrl) = fetchAttractionDetails(place.place_id)
                            val attraction = Attraction(
                                name = place.name,
                                lat = place.geometry.location.lat,
                                lng = place.geometry.location.lng,
                                description = description,
                                imageUrl = imageUrl
                            )
                            attractionsMap[place.place_id] = attraction
                        }
                    }
                    if (response.next_page_token != null) {
                        Thread.sleep(2000)
                        url = "/maps/api/place/nearbysearch/json?pagetoken=${response.next_page_token}&key=$apiKey"
                    } else {
                        break
                    }
                } else {
                    break
                }
            } while (true)
        }
        return attractionsMap.values.toList()
    }
}
