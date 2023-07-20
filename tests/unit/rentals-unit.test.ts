import { date } from "joi";
import rentalsRepository from "repositories/rentals-repository";
import rentalsService from "services/rentals-service";
import { faker } from "@faker-js/faker"
import { makeFakeOpenRental, makeFakeOpenRentalWithMovies } from "../factories/rental-factory";
import { makeFakeAdultUser } from "../factories/user-factory";
import { makeFakeOpenMovie } from "../factories/movie-factory";

describe("Rentals Service Unit Tests", () => {
  it("should return rentals", async () => {

    const fakeRental = makeFakeOpenRental();

    jest.spyOn(rentalsRepository, "getRentals").mockImplementationOnce((): any => {
      return [fakeRental]
    });

    const rentals = await rentalsService.getRentals();

    expect(rentals).toHaveLength(1);
    expect(rentals).toEqual([
      {
        id: fakeRental.id,
        date: fakeRental.date,
        endDate: fakeRental.endDate,
        userId: fakeRental.userId,
        closed: fakeRental.closed
      }
    ]);
  })

  it("should return rental by id", async () => {

    const fakeRentalWithMovies = makeFakeOpenRentalWithMovies();

    jest.spyOn(rentalsRepository, "getRentalById").mockImplementationOnce((): any => {
      return fakeRentalWithMovies;
    })

    const rental = await rentalsService.getRentalById(fakeRentalWithMovies.id);

    expect(rental).toEqual({
      id: fakeRentalWithMovies.id,
      date: fakeRentalWithMovies.date,
      endDate: fakeRentalWithMovies.endDate,
      userId: fakeRentalWithMovies.userId,
      closed: fakeRentalWithMovies.closed,
      movies: [
        {
          id: expect.any(Number),
          name: expect.any(String),
          adultsOnly: expect.any(Boolean),
          rentalId: expect.any(Number)
        }
      ]
    });
  });

  it("should return error when rental not found", async () => {

    jest.spyOn(rentalsRepository, "getRentalById").mockImplementationOnce((): any => {
      return null;
    })

    const promise = rentalsService.getRentalById(1);

    expect(promise).rejects.toEqual({
      name: "NotFoundError",
      message: "Rental not found."
    });
  });

  it("should create a rental", async () => {
    const user = makeFakeAdultUser();
    const movie = makeFakeOpenMovie();

    jest.spyOn(rentalsService, "getUserForRental").mockImplementationOnce((): any => {
      return {
        user
      }
    });

    jest.spyOn(rentalsService, "checkUserAbleToRental").mockImplementationOnce((): any => {
      return {}
    });

    jest.spyOn(rentalsService, "checkMoviesValidForRental").mockImplementationOnce((): any => {
      return {}
    });

    jest.spyOn(rentalsRepository, "createRental").mockImplementationOnce((): any => {
      return {
        id: faker.number.int(2),
        date: faker.date.recent(),
        endDate: null,
        userId: user.id,
        closed: false,
      }
    });

    const rental = await rentalsService.createRental({
      userId: user.id,
      moviesId: [movie.id]
    });

    expect(rental).toEqual({
      id: expect.any(Number),
      date: expect.any(Date),
      endDate: null,
      userId: user.id,
      closed: false,
    });

  })
})
