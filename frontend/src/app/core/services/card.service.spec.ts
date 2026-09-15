import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CardService, CardRequest, Priority } from './card.service';
import { environment } from '../../../environments/environment';

describe('CardService', () => {
  let service: CardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CardService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET all cards', () => {
    const mockCards = [{ id: 1, title: 'Card 1' }];
    service.getAll().subscribe(cards => {
      expect(cards).toEqual(mockCards as never);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/cards`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCards);
  });

  it('should POST create card with correct body', () => {
    const data: CardRequest = {
      title: 'Novo card',
      description: 'desc',
      priority: 'High' as Priority,
      columnId: 5,
      labelIds: [1, 2],
    };

    service.create(data).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/cards`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush({ id: 1 });
  });

  it('should PUT update card', () => {
    const data: CardRequest = {
      title: 'Atualizado',
      priority: 'Low' as Priority,
      columnId: 3,
      labelIds: [],
    };

    service.update(9, data).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/cards/9`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(data);
    req.flush({ id: 9 });
  });

  it('should PATCH move card to column', () => {
    service.move(4, 7).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/cards/4/column`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ columnId: 7 });
    req.flush(null);
  });

  it('should DELETE card', () => {
    service.delete(2).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/cards/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should POST duplicate card', () => {
    const mockCopy = { id: 10, title: 'Card 1 (cópia)' };

    service.duplicate(1).subscribe(copy => {
      expect(copy).toEqual(mockCopy as never);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/cards/1/duplicate`);
    expect(req.request.method).toBe('POST');
    req.flush(mockCopy);
  });
});
