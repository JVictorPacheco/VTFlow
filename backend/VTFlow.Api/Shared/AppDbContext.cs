using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using VTFlow.Api.Features.Boards;
using VTFlow.Api.Features.Cards;
using VTFlow.Api.Features.Columns;
using VTFlow.Api.Features.Labels;
using VTFlow.Api.Shared;

namespace VTFlow.Api.Shared;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Board> Boards => Set<Board>();
    public DbSet<Label> Labels => Set<Label>();
    public DbSet<Column> Columns => Set<Column>();
    public DbSet<Card> Cards => Set<Card>();
    public DbSet<CardLabel> CardLabels => Set<CardLabel>();
    public DbSet<Subtask> Subtasks => Set<Subtask>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<CardActivity> CardActivities => Set<CardActivity>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<Board>()
            .HasOne(b => b.User)
            .WithMany(u => u.Boards)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Column>()
            .HasOne(c => c.User)
            .WithMany(u => u.Columns)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Card>()
            .HasOne(c => c.User)
            .WithMany(u => u.Cards)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<CardLabel>()
            .HasKey(cl => new { cl.CardId, cl.LabelId });

        modelBuilder.Entity<Board>()
            .HasMany(b => b.Columns)
            .WithOne(c => c.Board)
            .HasForeignKey(c => c.BoardId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
