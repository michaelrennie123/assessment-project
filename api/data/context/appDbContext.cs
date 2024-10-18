using Microsoft.EntityFrameworkCore;
using api.data.models;

namespace api.data.context
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<Customer> Customers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Customer>()
            .Property(c => c.Id)
            .ValueGeneratedOnAdd();

            modelBuilder.Entity<Customer>()
            .Property(c => c.CreatedOn)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<Customer>()
            .Property(c => c.LastUpdatedOn)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }

        public override int SaveChanges()
        {
            // Automatically set LastUpdatedOn to DateTime.Now before saving
            foreach (var entry in ChangeTracker.Entries<Customer>())
            {
                if (entry.State == EntityState.Modified)
                {
                    entry.Entity.LastUpdatedOn = DateTime.Now;
                }
            }

            return base.SaveChanges();
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            // Automatically set LastUpdatedOn to DateTime.Now before saving
            foreach (var entry in ChangeTracker.Entries<Customer>())
            {
                if (entry.State == EntityState.Modified)
                {
                    entry.Entity.LastUpdatedOn = DateTime.Now;
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}
