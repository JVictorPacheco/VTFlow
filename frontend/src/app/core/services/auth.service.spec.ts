import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    router = { navigate: vi.fn() };
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should POST login, store token, and navigate', () => {
    service.login('user', 'pass123').subscribe(res => {
      expect(res.token).toBe('test-token');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'user', password: 'pass123' });
    req.flush({ token: 'test-token' });

    expect(localStorage.getItem('auth_token')).toBe('test-token');
    expect(router.navigate).toHaveBeenCalledWith(['/boards']);
  });

  it('should POST register and navigate', () => {
    service.register('newuser', 'pass123').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush(null, { status: 201, statusText: 'Created' });

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should remove token on logout and navigate', () => {
    localStorage.setItem('auth_token', 'token');
    service.logout();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return true when token exists', () => {
    localStorage.setItem('auth_token', 'token');
    expect(service.isAuthenticated()).toBeTruthy();
  });

  it('should return false when no token', () => {
    expect(service.isAuthenticated()).toBeFalsy();
  });

  it('should return token from localStorage', () => {
    localStorage.setItem('auth_token', 'token');
    expect(service.getToken()).toBe('token');
  });

  it('should return null when no token', () => {
    expect(service.getToken()).toBeNull();
  });
});
