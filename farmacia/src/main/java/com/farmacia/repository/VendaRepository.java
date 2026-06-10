package com.farmacia.repository;

import com.farmacia.model.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VendaRepository extends JpaRepository<Venda, Long> {

    List<Venda> findByClienteId(Long clienteId);

    List<Venda> findByStatus(Venda.StatusVenda status);

    @Query("SELECT v FROM Venda v WHERE v.criadoEm BETWEEN :inicio AND :fim")
    List<Venda> findByPeriodo(LocalDateTime inicio, LocalDateTime fim);

    @Query("SELECT COALESCE(SUM(v.valorTotal - v.desconto), 0) FROM Venda v WHERE v.status = 'CONCLUIDA' AND v.criadoEm BETWEEN :inicio AND :fim")
    BigDecimal somarVendasPorPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query("SELECT COUNT(v) FROM Venda v WHERE v.status = 'CONCLUIDA' AND v.criadoEm BETWEEN :inicio AND :fim")
    Long contarVendasPorPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}
