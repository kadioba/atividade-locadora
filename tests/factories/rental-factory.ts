import { faker } from "@faker-js/faker";

export function makeFakeOpenRental() {
    return {
        id: faker.number.int(2),
        date: faker.date.recent(),
        endDate: null,
        userId: faker.number.int(2),
        closed: false,
    }
}

export function makeFakeOpenRentalWithMovies() {
    const rentalId = faker.number.int(2);
    return {
        id: rentalId,
        date: faker.date.recent(),
        endDate: null,
        userId: faker.number.int(2),
        closed: false,
        movies: [
            {
                id: faker.number.int(2),
                name: faker.music.songName(),
                adultsOnly: false,
                rentalId: rentalId
            }
        ]
    }
}